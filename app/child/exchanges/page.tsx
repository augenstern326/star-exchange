'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Exchange {
  id: string;
  productId: string;
  quantity: number;
  totalCost: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  productName?: string;
}

interface User {
  id: string;
  name: string;
  totalStars: number;
}

export default function Exchanges() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    // Fetch exchanges
    fetchExchanges(user.id);
  }, [router]);

  const fetchExchanges = async (userId: string) => {
    try {
      const response = await fetch(`/api/exchanges?userId=${userId}`);
      const data = await response.json();
      // Add mock product names
      const enriched = data.map((ex: Exchange) => ({
        ...ex,
        productName: `商品 ${ex.productId.slice(-1)}`,
      }));
      setExchanges(enriched);
    } catch (error) {
      console.error('Failed to fetch exchanges:', error);

    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary' as const;
      case 'completed':
        return 'default' as const;
      case 'cancelled':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <h1 className="text-xl font-bold text-foreground">我的兑换</h1>
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
        {exchanges.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <div className="text-5xl mb-4">🎁</div>
            <p className="text-lg text-foreground font-semibold">
              还没有兑换过礼物
            </p>
            <p className="text-muted-foreground mt-2 mb-6">
              去星星商城兑换心仪的礼物吧！
            </p>
            <Link href="/child/mall">
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                前往商城
              </button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {exchanges.map((exchange) => (
              <Card
                key={exchange.id}
                className="p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Product Info */}
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-5xl">🎁</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {exchange.productName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          数量: {exchange.quantity}
                        </p>
                        <Badge color={getStatusColor(exchange.status)}>
                          {getStatusLabel(exchange.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right: Cost and Date */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">
                        花费星星
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <Image
                          src="/star.png"
                          alt="星星"
                          width={32}
                          height={32}
                        />
                        <span className="text-2xl font-bold text-primary">
                          {exchange.totalCost}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(exchange.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-4 pt-4 border-t border-border">
                  {exchange.status === 'pending' && (
                    <p className="text-sm text-accent">
                      ⏳ 正在处理中，请稍候...
                    </p>
                  )}
                  {exchange.status === 'completed' && (
                    <p className="text-sm text-green-600">
                      ✓ 已完成！请到家长那里领取你的礼物。
                    </p>
                  )}
                  {exchange.status === 'cancelled' && (
                    <p className="text-sm text-destructive">
                      ✕ 已取消，星星已退还。
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
