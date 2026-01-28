'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  nickname: string;
  star_balance: number;
  user_type: 'parent' | 'child';
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChildUser = async () => {
      try {
        // Fetch the first (default) child user from database
        const response = await fetch('/api/users/default-child');
        if (!response.ok) {
          throw new Error('无法加载小孩数据');
        }
        const user = await response.json();
        setCurrentUser({
          id: user.id.toString(),
          nickname: user.nickname || '小朋友',
          star_balance: user.star_balance,
          user_type: 'child',
        });
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    loadChildUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-foreground text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-red-600 font-semibold mb-4">{error || '无法加载数据'}</p>
          <Link href="/login">
            <Button className="w-full">返回登录</Button>
          </Link>
        </Card>
      </div>
    );
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
              {currentUser.nickname}的星星存折
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/parent/login">
              <Button variant="ghost" size="sm">
                登录
              </Button>
            </Link>
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
              <h2 className="text-5xl font-bold">{currentUser.star_balance}</h2>
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
            </Card>
          </Link>

          {/* 消费记录 */}
          {/*<Link href="/child/history">*/}
          {/*  <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">*/}
          {/*    <div className="text-5xl">📊</div>*/}
          {/*    <h3 className="text-xl font-bold text-foreground">消费记录</h3>*/}
          {/*    <p className="text-sm text-muted-foreground">查看星星流水</p>*/}
          {/*  </Card>*/}
          {/*</Link>*/}

          {/* 我的兑换 */}
          {/*<Link href="/child/exchanges">*/}
          {/*  <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">*/}
          {/*    <div className="text-5xl">🎁</div>*/}
          {/*    <h3 className="text-xl font-bold text-foreground">我的兑换</h3>*/}
          {/*    <p className="text-sm text-muted-foreground">查看已兑换礼物</p>*/}
          {/*  </Card>*/}
          {/*</Link>*/}
        </div>
      </div>
    </div>
  );
}
