'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  image?: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  isParent: boolean;
}

export default function ParentProducts() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInventory, setEditInventory] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/parent/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user.isParent) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    fetchProducts(user.id);
  }, [router]);

  const fetchProducts = async (parentId: string) => {
    try {
      const response = await fetch(`/api/products?parentId=${parentId}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInventory = async (productId: string, newInventory: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: newInventory }),
      });

      if (!response.ok) {
        toast.error('更新库存失败');
        return;
      }

      toast.success('库存已更新');
      setEditingId(null);
      if (currentUser) {
        fetchProducts(currentUser.id);
      }
    } catch (error) {
      toast.error('更新出错');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('删除失败');
        return;
      }

      toast.success('商品已删除');
      if (currentUser) {
        fetchProducts(currentUser.id);
      }
    } catch (error) {
      toast.error('删除出错');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 flex items-center justify-center">
        <p className="text-foreground">加载中...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/parent/dashboard" className="flex items-center gap-2 hover:opacity-70">
            <span className="text-2xl">←</span>
            <h1 className="text-xl font-bold text-foreground">商品管理</h1>
          </Link>
          <Link href="/parent/products/create">
            <Button size="sm">新建商品</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <div className="text-5xl mb-4">🏪</div>
            <p className="text-lg text-foreground font-semibold">
              还没有商品
            </p>
            <p className="text-muted-foreground mt-2 mb-6">
              点击下面的按钮发布第一个商品
            </p>
            <Link href="/parent/products/create">
              <Button>发布商品</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="bg-white overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* Product Image */}
                <div className="bg-secondary/10 h-40 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">🎁</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">⭐</span>
                    <span className="font-bold text-lg text-primary">
                      {product.price}
                    </span>
                  </div>

                  {/* Inventory Management */}
                  <div className="mb-4 p-3 bg-accent/10 rounded-lg">
                    {editingId === product.id ? (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">更新库存</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={editInventory}
                            onChange={(e) =>
                              setEditInventory(parseInt(e.target.value) || 0)
                            }
                            className="text-sm py-2"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateInventory(product.id, editInventory)
                            }
                            className="px-2"
                          >
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="px-2"
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:opacity-70"
                        onClick={() => {
                          setEditingId(product.id);
                          setEditInventory(product.inventory);
                        }}
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          库存
                        </p>
                        <p className="font-bold text-lg text-foreground">
                          {product.inventory} 件
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        setEditingId(product.id);
                        setEditInventory(product.inventory);
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
