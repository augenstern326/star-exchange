'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { message } from 'antd';

interface User {
  id: string;
  name: string;
  isParent: boolean;
}

export default function CreateProduct() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    inventory: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'inventory'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          image: base64String,
        }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      message.error('请输入商品名称');
      return;
    }

    if (Number(formData.price) <= 0) {
      message.error('请输入正确的价格');
      return;
    }

    if (Number(formData.inventory) < 0) {
      message.error('库存不能为负数');
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        inventory: formData.inventory,
        image: formData.image,
        parentId: currentUser?.id,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        message.error('创建商品失败');
        setSubmitting(false);
        return;
      }

      message.success('商品已发布！');
      router.push('/parent/products');
    } catch (error) {
      message.error('创建商品出错');
      setSubmitting(false);
    }
  };

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
          <Link href="/parent/products" className="text-2xl hover:opacity-70">
            ←
          </Link>
          <h1 className="text-2xl font-bold text-foreground">发布新商品</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Details */}
          <Card className="p-6 bg-white space-y-4">
            <div>
              <Label htmlFor="name" className="block mb-2">
                商品名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="例如：小玩具、漫画书"
                value={formData.name}
                onChange={handleChange}
                className="text-lg py-6"
              />
            </div>

            <div>
              <Label htmlFor="description" className="block mb-2">
                商品描述
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="描述商品的特点和吸引力"
                value={formData.description}
                onChange={handleChange}
                className="min-h-32"
              />
            </div>

            <div>
              <Label htmlFor="image" className="block mb-2">
                商品图片
              </Label>
              <div className="border-2 border-dashed border-secondary rounded-lg p-4">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-4 relative w-full h-48">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="商品预览"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="block mb-2">
                  价格（星星） <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="text-lg py-6"
                  />
                  <span className="text-2xl">⭐</span>
                </div>
              </div>

              <div>
                <Label htmlFor="inventory" className="block mb-2">
                  库存数量 <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="inventory"
                    name="inventory"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.inventory}
                    onChange={handleChange}
                    className="text-lg py-6"
                  />
                  <span className="text-muted-foreground">件</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6 bg-white">
            <p className="text-sm text-muted-foreground mb-4">预览</p>
            <div className="border border-border rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="商品预览"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-5xl mb-3">🎁</div>
              )}
              <h3 className="text-lg font-bold text-foreground mb-1">
                {formData.name || '商品名称'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {formData.description || '商品描述'}
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">⭐</span>
                <span className="text-lg font-bold text-primary">
                  {formData.price || 0}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                剩余 {formData.inventory || 0} 件
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/parent/products" className="flex-1">
              <Button variant="outline" className="w-full py-6 bg-transparent" disabled={submitting}>
                取消
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 py-6 text-lg"
              disabled={submitting}
            >
              {submitting ? '发布中...' : '发布商品'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
