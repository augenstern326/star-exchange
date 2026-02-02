'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { message } from 'antd';
import { Package, PackageCheck, PackageX } from 'lucide-react';
import { Product, User, ProductFilter } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterTabs } from '@/components/shared/FilterTabs';
import { StatsCard } from '@/components/shared/StatsCard';
import { ProductGridSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ParentProducts() {
  const { user, loading: authLoading } = useAuth({ requireParent: true, redirectTo: '/parent/login' });
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInventory, setEditInventory] = useState(0);
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProducts(user.id);
    }
  }, [user]);

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
        message.error('更新库存失败');
        return;
      }

      message.success('库存已更新');
      setEditingId(null);
      if (user) {
        fetchProducts(user.id);
      }
    } catch (error) {
      message.error('更新出错');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        message.error('删除失败');
        return;
      }

      message.success('商品已删除');
      if (user) {
        fetchProducts(user.id);
      }
    } catch (error) {
      message.error('删除出错');
    }
  };

  // 计算统计数据
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.inventory > 0).length;
    const outOfStock = products.filter(p => p.inventory === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.inventory), 0);

    return { total, inStock, outOfStock, totalValue };
  }, [products]);

  // 筛选和搜索
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 库存筛选
      if (filter === 'in_stock' && product.inventory === 0) return false;
      if (filter === 'out_of_stock' && product.inventory > 0) return false;

      // 搜索关键词
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        return (
          product.name.toLowerCase().includes(keyword) ||
          product.description.toLowerCase().includes(keyword)
        );
      }

      return true;
    });
  }, [products, filter, searchKeyword]);

  // 筛选选项
  const filterOptions = [
    { value: 'all', label: '全部商品', count: stats.total },
    { value: 'in_stock', label: '有库存', count: stats.inStock },
    { value: 'out_of_stock', label: '已售罄', count: stats.outOfStock },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ProductGridSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
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
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatsCard
            title="全部商品"
            value={stats.total}
            emoji="📦"
          />
          <StatsCard
            title="有库存"
            value={stats.inStock}
            emoji="✅"
          />
          <StatsCard
            title="已售罄"
            value={stats.outOfStock}
            emoji="❌"
          />
          <StatsCard
            title="总价值"
            value={`${stats.totalValue}⭐`}
            emoji="💰"
          />
        </div>

        {/* 搜索栏 */}
        <SearchBar
          value={searchKeyword}
          onChange={setSearchKeyword}
          placeholder="搜索商品名称或描述..."
          className="mb-4"
        />

        {/* Filter Tabs */}
        <FilterTabs
          options={filterOptions}
          value={filter}
          onChange={(value) => setFilter(value as ProductFilter)}
          className="mb-6"
        />

        {filteredProducts.length === 0 ? (
          <Card className="p-8 md:p-12 text-center bg-white">
            <div className="text-4xl md:text-5xl mb-4">
              {searchKeyword ? '🔍' : '🏪'}
            </div>
            <p className="text-base md:text-lg text-foreground font-semibold">
              {searchKeyword
                ? '没有找到匹配的商品'
                : filter === 'out_of_stock'
                ? '没有售罄的商品'
                : filter === 'in_stock'
                ? '没有有库存的商品'
                : '还没有商品'}
            </p>
            <p className="text-sm md:text-base text-muted-foreground mt-2 mb-6">
              {searchKeyword ? '试试其他关键词' : '点击下面的按钮发布第一个商品'}
            </p>
            {!searchKeyword && (
              <Link href="/parent/products/create">
                <Button>发布商品</Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-white overflow-hidden hover:shadow-lg transition-shadow active:scale-[0.99] flex flex-col py-0"
              >
                {/* Product Image */}
                <div className="bg-secondary/10 h-48 md:h-60 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl md:text-6xl">🎁</div>
                  )}
                  {product.inventory === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg md:text-xl">已售罄</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 flex-1 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <span className="text-xl md:text-2xl">⭐</span>
                    <span className="font-bold text-base md:text-lg text-primary">
                      {product.price}
                    </span>
                  </div>

                  {/* Inventory Management */}
                  <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-accent/10 rounded-lg">
                    {editingId === product.id ? (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">更新库存</Label>
                        <div className="flex gap-1.5 md:gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={editInventory}
                            onChange={(e) =>
                              setEditInventory(parseInt(e.target.value) || 0)
                            }
                            className="text-sm py-1.5 md:py-2"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateInventory(product.id, editInventory)
                            }
                            className="px-2 md:px-3 text-xs md:text-sm"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="px-2 md:px-3 text-xs md:text-sm"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:opacity-70 active:opacity-50"
                        onClick={() => {
                          setEditingId(product.id);
                          setEditInventory(product.inventory);
                        }}
                      >
                        <p className="text-xs text-muted-foreground mb-0.5">
                          库存
                        </p>
                        <p className={`font-bold text-base md:text-lg ${
                          product.inventory === 0 ? 'text-destructive' : 'text-foreground'
                        }`}>
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
                      className="flex-1 bg-transparent text-xs md:text-sm"
                      onClick={() => {
                        setEditingId(product.id);
                        setEditInventory(product.inventory);
                      }}
                    >
                      📝 编辑
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1 text-xs md:text-sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      🗑️ 删除
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
