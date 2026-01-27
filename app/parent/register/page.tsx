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

export default function ParentRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    childName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, password, confirmPassword, childName } = formData;

    if (!name.trim() || !email.trim() || !password.trim() || !childName.trim()) {
      toast.error('请填写所有字段');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      toast.error('密码至少需要6个字符');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          isParent: true,
          childName,
        }),
      });

      if (!response.ok) {
        toast.error('注册失败');
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      toast.success('注册成功！');
      router.push('/parent/dashboard');
    } catch (error) {
      toast.error('注册出错');
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
          <p className="text-muted-foreground mt-2">创建家长账号</p>
        </div>

        {/* Register Card */}
        <Card className="p-8 bg-white shadow-lg mb-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                你的名字
              </label>
              <Input
                type="text"
                name="name"
                placeholder="输入你的名字"
                value={formData.name}
                onChange={handleChange}
                className="py-5"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                孩子的名字
              </label>
              <Input
                type="text"
                name="childName"
                placeholder="输入孩子的名字"
                value={formData.childName}
                onChange={handleChange}
                className="py-5"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                邮箱
              </label>
              <Input
                type="email"
                name="email"
                placeholder="输入邮箱"
                value={formData.email}
                onChange={handleChange}
                className="py-5"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                密码
              </label>
              <Input
                type="password"
                name="password"
                placeholder="输入密码（至少6个字符）"
                value={formData.password}
                onChange={handleChange}
                className="py-5"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                确认密码
              </label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="确认密码"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="py-5"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full text-lg py-6 mt-6"
              disabled={loading}
            >
              {loading ? '创建中...' : '创建账号'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">
              已有账号？
            </p>
            <Link href="/parent/login">
              <Button variant="outline" className="w-full bg-transparent">
                返回登录
              </Button>
            </Link>
          </div>
        </Card>

        {/* Back Link */}
        <div className="text-center">
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
