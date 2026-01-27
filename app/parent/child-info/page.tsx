'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  childName?: string;
  isParent: boolean;
}

export default function ChildInfo() {
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
    setCurrentUser(user);
    setLoading(false);
  }, [router]);

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/parent/dashboard" className="text-2xl hover:opacity-70">
            ←
          </Link>
          <h1 className="text-2xl font-bold text-foreground">孩子中心</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Child Profile */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 mb-8 text-center">
          <div className="text-7xl mb-4">👧</div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {currentUser.childName}
          </h2>
          <p className="text-muted-foreground mb-6">
            家长: {currentUser.name}
          </p>
        </Card>

        {/* Child Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white text-center">
            <p className="text-muted-foreground text-sm mb-3">当前星星</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl font-bold text-primary">50</span>
              <Image src="/star.png" alt="星星" width={48} height={48} />
            </div>
            <p className="text-xs text-muted-foreground">
              通过完成任务和表现获得
            </p>
          </Card>

          <Card className="p-6 bg-white text-center">
            <p className="text-muted-foreground text-sm mb-3">本月统计</p>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                获得: <span className="text-green-600">+50</span> ⭐
              </p>
              <p className="font-semibold text-foreground">
                消费: <span className="text-red-600">-20</span> ⭐
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-white mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">快速操作</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-semibold text-foreground">立即奖励</p>
                <p className="text-sm text-muted-foreground">给孩子奖励星星</p>
              </div>
              <Button size="sm">奖励</Button>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-semibold text-foreground">扣除星星</p>
                <p className="text-sm text-muted-foreground">因为不良表现</p>
              </div>
              <Button size="sm" variant="destructive">
                扣除
              </Button>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <Link href="/parent/dashboard">
          <Button className="w-full py-6 text-lg">返回管理中心</Button>
        </Link>
      </div>
    </div>
  );
}
