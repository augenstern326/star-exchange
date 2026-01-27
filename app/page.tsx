'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  totalStars: number;
  isParent: boolean;
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get current user from localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    } else {
      // Auto-login as child user without requiring input
      const defaultChild = {
        id: `child_${Date.now()}`,
        name: '小朋友',
        totalStars: 50,
        isParent: false,
      };
      setCurrentUser(defaultChild);
      localStorage.setItem('currentUser', JSON.stringify(defaultChild));
    }
    setLoading(false);
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-foreground text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  if (currentUser.isParent) {
    return <div>正在重定向到家长界面...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/star.png"
              alt="星星"
              width={32}
              height={32}
            />
            <h1 className="text-2xl font-bold text-foreground">
              {currentUser.name}的星星存折
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/parent/login">
              <Button variant="ghost" size="sm">
                家长
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem('currentUser');
                setCurrentUser(null);
              }}
            >
              退出
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Star Balance Card */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-white mb-8 p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-lg mb-2">我的星星</p>
              <h2 className="text-5xl font-bold">{currentUser.totalStars}</h2>
            </div>
            <Image
              src="/star.png"
              alt="星星"
              width={120}
              height={120}
              className="opacity-80"
            />
          </div>
        </Card>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 星星商城 */}
          <Link href="/child/mall">
            <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">
              <Image
                src="/gift-box.png"
                alt="商品"
                width={64}
                height={64}
              />
              <h3 className="text-xl font-bold text-foreground">星星商城</h3>
              <p className="text-sm text-muted-foreground">兑换心仪的礼物</p>
            </Card>
          </Link>

          {/* 星星任务 */}
          <Link href="/child/tasks">
            <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">
              <Image
                src="/task-icon.png"
                alt="任务"
                width={64}
                height={64}
              />
              <h3 className="text-xl font-bold text-foreground">星星任务</h3>
              <p className="text-sm text-muted-foreground">完成任务赚星星</p>
            </Card>
          </Link>

          {/* 消费记录 */}
          <Link href="/child/history">
            <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">
              <div className="text-5xl">📊</div>
              <h3 className="text-xl font-bold text-foreground">消费记录</h3>
              <p className="text-sm text-muted-foreground">查看星星流水</p>
            </Card>
          </Link>

          {/* 我的兑换 */}
          <Link href="/child/exchanges">
            <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">
              <div className="text-5xl">🎁</div>
              <h3 className="text-xl font-bold text-foreground">我的兑换</h3>
              <p className="text-sm text-muted-foreground">查看已兑换礼物</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
