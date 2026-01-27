'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: number;
  image?: string;
}

interface User {
  id: string;
  name: string;
  totalStars: number;
}

export default function Mall() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(userStr));
    
    // Fetch products
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Use mock data for demo
      setProducts([
        {
          id: 'prod1',
          name: '小玩具车',
          description: '可爱的玩具小汽车',
          price: 20,
          inventory: 5,
        },
        {
          id: 'prod2',
          name: '漫画书',
          description: '有趣的漫画故事',
          price: 15,
          inventory: 3,
        },
        {
          id: 'prod3',
          name: '糖果礼盒',
          description: '各种美味的糖果',
          price: 10,
          inventory: 10,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async (product: Product) => {
    if (!currentUser) return;

    if (currentUser.totalStars < product.price) {
      toast.error('星星不足，无法兑换');
      return;
    }

    if (product.inventory <= 0) {
      toast.error('商品已售罄');
      return;
    }

    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          productId: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || '兑换失败');
        return;
      }

      // Update user stars
      const newStars = currentUser.totalStars - product.price;
      const updatedUser = { ...currentUser, totalStars: newStars };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      toast.success('兑换成功！');
      fetchProducts();
    } catch (error) {
      toast.error('兑换出错');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 flex items-center justify-center">
        <p className="text-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70">
            <span className="text-2xl">←</span>
            <h1 className="text-xl font-bold text-foreground">星星商城</h1>
          </Link>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Image src="/star.png" alt="星星" width={24} height={24} />
            <span className="font-bold text-primary text-lg">
              {currentUser?.totalStars}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <div className="text-5xl mb-4">🏪</div>
            <p className="text-lg text-foreground font-semibold">
              商城还没有商品
            </p>
            <p className="text-muted-foreground mt-2">
              请稍候，家长们会很快上传商品！
            </p>
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

                  {/* Price and Stock */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/star.png"
                        alt="星星"
                        width={24}
                        height={24}
                      />
                      <span className="font-bold text-lg text-primary">
                        {product.price}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        product.inventory > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {product.inventory > 0
                        ? `剩余 ${product.inventory}`
                        : '售罄'}
                    </span>
                  </div>

                  {/* Exchange Button */}
                  <Button
                    onClick={() => handleExchange(product)}
                    disabled={
                      product.inventory <= 0 ||
                      (currentUser?.totalStars || 0) < product.price
                    }
                    className="w-full"
                  >
                    {product.inventory <= 0
                      ? '售罄'
                      : (currentUser?.totalStars || 0) < product.price
                        ? '星星不足'
                        : '立即兑换'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
