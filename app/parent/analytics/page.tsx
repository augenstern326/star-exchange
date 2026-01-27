'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface User {
  id: string;
  name: string;
  isParent: boolean;
}

export default function Analytics() {
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
          <h1 className="text-2xl font-bold text-foreground">数据统计</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white text-center">
            <p className="text-muted-foreground text-sm mb-2">已发布任务</p>
            <p className="text-3xl font-bold text-primary">12</p>
          </Card>

          <Card className="p-6 bg-white text-center">
            <p className="text-muted-foreground text-sm mb-2">已完成任务</p>
            <p className="text-3xl font-bold text-green-600">8</p>
          </Card>

          <Card className="p-6 bg-white text-center">
            <p className="text-muted-foreground text-sm mb-2">已上架商品</p>
            <p className="text-3xl font-bold text-accent">5</p>
          </Card>

          <Card className="p-6 bg-white text-center">
            <p className="text-muted-foreground text-sm mb-2">已发放星星</p>
            <p className="text-3xl font-bold text-primary">150</p>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Statistics */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold text-foreground mb-6">任务统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">总任务数</span>
                <span className="font-bold text-lg">12</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">待处理任务</span>
                <span className="font-bold text-lg text-accent">4</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">已完成任务</span>
                <span className="font-bold text-lg text-green-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">完成率</span>
                <span className="font-bold text-lg text-primary">67%</span>
              </div>
            </div>
          </Card>

          {/* Star Statistics */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold text-foreground mb-6">星星统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">已发放星星</span>
                <span className="font-bold text-lg">150 ⭐</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">已兑换星星</span>
                <span className="font-bold text-lg text-red-600">-60 ⭐</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">已扣除星星</span>
                <span className="font-bold text-lg text-red-600">-20 ⭐</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">孩子当前余额</span>
                <span className="font-bold text-lg text-primary">70 ⭐</span>
              </div>
            </div>
          </Card>

          {/* Product Statistics */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold text-foreground mb-6">商品统计</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">上架商品数</span>
                <span className="font-bold text-lg">5</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">已售出商品</span>
                <span className="font-bold text-lg">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">剩余库存</span>
                <span className="font-bold text-lg">12 件</span>
              </div>
            </div>
          </Card>

          {/* Monthly Trend */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-bold text-foreground mb-6">本月概览</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">新发布任务</span>
                <span className="font-bold text-lg">8</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-foreground">新上架商品</span>
                <span className="font-bold text-lg">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">发放星星</span>
                <span className="font-bold text-lg">+100 ⭐</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
