'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function ChildLogin() {
  const router = useRouter();
  const [userType, setUserType] = useState<'child' | 'parent'>('child');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill with first child user for demo
  const handleLoginFirstChild = async () => {
    setUsername('child1');
    setPassword('child123');
    setUserType('child');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          userType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || '登录失败');
        return;
      }

      const data = await response.json();
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      toast.success('登录成功！');

      // Redirect based on user type
      if (data.user.userType === 'parent') {
        router.push('/parent/dashboard');
      } else {
        router.push('/child/tasks');
      }
    } catch (error) {
      console.error('[v0] Login error:', error);
      toast.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/star.png"
            alt="星星"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground">星星存折</h1>
          <p className="text-muted-foreground mt-2">用户登录</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 bg-white shadow-lg">
          <Tabs value={userType} onValueChange={(value) => setUserType(value as 'child' | 'parent')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="child">小孩</TabsTrigger>
              <TabsTrigger value="parent">家长</TabsTrigger>
            </TabsList>

            <TabsContent value="child" className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    用户名
                  </label>
                  <Input
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-lg py-6"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    密码
                  </label>
                  <Input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg py-6"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg py-6"
                  disabled={loading}
                >
                  {loading ? '登录中...' : '小孩登录'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="parent" className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    用户名
                  </label>
                  <Input
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-lg py-6"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    密码
                  </label>
                  <Input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg py-6"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg py-6"
                  disabled={loading}
                >
                  {loading ? '登录中...' : '家长登录'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-accent/20 rounded-lg text-center">
          <p className="text-sm text-foreground font-semibold mb-3">
            💡 演示账号
          </p>
          <p className="text-xs text-foreground mb-2">
            小孩: username: <code>child1</code> | password: <code>child123</code>
          </p>
          <p className="text-xs text-foreground mb-3">
            家长: username: <code>parent1</code> | password: <code>password123</code>
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleLoginFirstChild}
          >
            快速登录 (小孩账号)
          </Button>
        </div>
      </div>
    </div>
  );
}
