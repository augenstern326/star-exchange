'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  isParent: boolean;
  childName?: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
    setCurrentUser({
      id: user.id.toString(),
      name: user.nickname ,
      isParent: user.isParent,
      childName: user.childName,
    });
    setLoading(false);
  }, [router]);

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

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              家长管理后台
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              localStorage.removeItem('currentUser');
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
              router.push('/');
            }}
          >
            退出
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">*/}
        {/*  <Card className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 shadow-lg">*/}
        {/*    <p className="text-white/90 mb-2">待处理任务</p>*/}
        {/*    <h2 className="text-4xl font-bold mb-2">0</h2>*/}
        {/*    <p className="text-sm text-white/80">需要审批</p>*/}
        {/*  </Card>*/}

        {/*  <Card className="bg-gradient-to-br from-accent to-accent/80 text-foreground p-6 shadow-lg">*/}
        {/*    <p className="text-muted-foreground mb-2">已发布任务</p>*/}
        {/*    <h2 className="text-4xl font-bold mb-2">0</h2>*/}
        {/*    <p className="text-sm text-muted-foreground">总计</p>*/}
        {/*  </Card>*/}

        {/*  <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-foreground p-6 shadow-lg">*/}
        {/*    <p className="text-muted-foreground mb-2">商品库存</p>*/}
        {/*    <h2 className="text-4xl font-bold mb-2">0</h2>*/}
        {/*    <p className="text-sm text-muted-foreground">件</p>*/}
        {/*  </Card>*/}
        {/*</div>*/}

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 任务管理 */}
          <Link href="/parent/tasks">
            <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">
              <div className="text-5xl">📋</div>
              <h3 className="text-xl font-bold text-foreground">任务管理</h3>
            </Card>
          </Link>
          {/* 商品管理 */}
          <Link href="/parent/products">
            <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">
              <div className="text-5xl">🏪</div>
              <h3 className="text-xl font-bold text-foreground">商品管理</h3>
            </Card>
          </Link>

          {/*/!* 孩子中心 *!/*/}
          {/*<Link href="/parent/child-info">*/}
          {/*  <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">*/}
          {/*    <div className="text-5xl">👧</div>*/}
          {/*    <h3 className="text-xl font-bold text-foreground">孩子中心</h3>*/}
          {/*  </Card>*/}
          {/*</Link>*/}

          {/* 数据统计 */}
          <Link href="/parent/analytics">
            <Card className="h-32 bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center gap-3 p-6">
              <div className="text-5xl">📊</div>
              <h3 className="text-xl font-bold text-foreground">积分记录</h3>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
