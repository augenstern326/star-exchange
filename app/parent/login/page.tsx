'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ParentLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userType: 'parent' }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || '登录失败');
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      toast.success('登录成功！');
      router.push('/parent/dashboard');
    } catch (error) {
      console.error('[v0] Login error:', error);
      toast.error('登录失败，请稍后重试');
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
          <p className="text-muted-foreground mt-2">家长管理中心</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 bg-white shadow-lg mb-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                用户名
              </label>
              <Input
                type="text"
                placeholder="输入用户名"
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
                placeholder="输入密码"
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
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground mb-4">
              还没有账号？
            </p>
            <Link href="/parent/register">
              <Button variant="outline" className="w-full bg-transparent">
                注册账号
              </Button>
            </Link>
          </div>
        </Card>

        {/* Demo Credentials */}
        <Card className="p-4 bg-accent/20 text-center">
          <p className="text-sm text-foreground font-semibold mb-2">
            演示账号
          </p>
          <p className="text-xs text-muted-foreground">
            用户名: parent1<br />
            密码: password123
          </p>
        </Card>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="ghost">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
