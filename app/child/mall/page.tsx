'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { message, Popconfirm } from 'antd';
import { Product, User, ProductFilter } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterTabs } from '@/components/shared/FilterTabs';
import { ProductGridSkeleton } from '@/components/shared/LoadingSkeleton';

export default function Mall() {
  const { user, loading: authLoading, updateUser } = useAuth({ requireAuth: true, redirectTo: '/login' });
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async (product: Product) => {
    if (!user) return;
    const userBalance = user.star_balance || user.totalStars || 0;

    if (userBalance < product.price) {
      message.error('星星不足，无法兑换');
      return;
    }

    if (product.inventory <= 0) {
      message.error('商品已售罄');
      return;
    }

    try {
      const response = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          price: product.price,
          productName: product.name,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        message.error(error.error || '兑换失败');
        return;
      }

      // Update user stars
      const newStars = userBalance - product.price;
      const updatedUser = { ...user, star_balance: newStars };
      updateUser(updatedUser);

      // Update product inventory
      setProducts(prevProducts =>
          prevProducts.map(p =>
              p.id === product.id
                  ? { ...p, inventory: p.inventory - 1 }
                  : p
          )
      );

      message.success('兑换成功！');
    } catch (error) {
      message.error('兑换出错');
    }
  };

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
    { value: 'all', label: '全部商品', count: products.length },
    { value: 'in_stock', label: '可兑换', count: products.filter(p => p.inventory > 0).length },
    { value: 'out_of_stock', label: '已售罄', count: products.filter(p => p.inventory === 0).length },
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
            <Link href="/" className="flex items-center gap-2 hover:opacity-70">
              <span className="text-2xl">←</span>
              <h1 className="text-xl font-bold text-foreground">星星商城</h1>
            </Link>
            <div className="flex items-center gap-2 bg-primary/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
              <Image src="/star.png" alt="星星" width={20} height={20} className="md:w-6 md:h-6" />
              <span className="font-bold text-primary text-base md:text-lg">
                {user?.star_balance || user?.totalStars || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
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
                    ? '暂无可兑换的商品'
                    : '商城还没有商品'}
                </p>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  {searchKeyword ? '试试其他关键词' : '请稍候，家长们会很快上传商品！'}
                </p>
              </Card>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const userBalance = user?.star_balance || user?.totalStars || 0;
                  const canAfford = userBalance >= product.price;
                  const inStock = product.inventory > 0;

                  return (
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
                        {!inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg md:text-xl">已售罄</span>
                          </div>
                        )}
                        {!canAfford && inStock && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            星星不足
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

                        {/* Price and Stock */}
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <Image
                                src="/star.png"
                                alt="星星"
                                width={20}
                                height={20}
                                className="md:w-6 md:h-6"
                            />
                            <span className="font-bold text-base md:text-lg text-primary">
                              {product.price}
                            </span>
                          </div>
                          <span
                              className={`text-xs md:text-sm font-semibold ${
                                  inStock ? 'text-green-600' : 'text-red-600'
                              }`}
                          >
                            {inStock ? `剩余 ${product.inventory}` : '售罄'}
                          </span>
                        </div>

                        {/* Exchange Button */}
                        <Popconfirm
                            title="是否要兑换此奖品?"
                            description={`需要消耗 ${product.price} 颗星星`}
                            onConfirm={() => handleExchange(product)}
                            okText="确定"
                            cancelText="取消"
                        >
                          <Button
                              disabled={!inStock || !canAfford}
                              className="w-full text-sm md:text-base"
                          >
                            {!inStock
                                ? '🚫 已售罄'
                                : !canAfford
                                ? '💫 星星不足'
                                : '🎁 立即兑换'}
                          </Button>
                        </Popconfirm>
                      </div>
                    </Card>
                  );
                })}
              </div>
          )}
        </div>
      </div>
  );
}