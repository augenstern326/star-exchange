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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  isParent: boolean;
}

export default function CreateTask() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [taskType, setTaskType] = useState<'approval' | 'direct_reward' | 'direct_penalty'>('approval');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: 0,
    penalty: 0,
    requiresApproval: true,
  });

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
      [name]: name.includes('reward') || name.includes('penalty') ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('请输入任务标题');
      return;
    }

    if (taskType === 'approval' && formData.reward <= 0) {
      toast.error('请输入正确的奖励星数');
      return;
    }

    setSubmitting(true);
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        reward: taskType === 'approval' ? formData.reward : (taskType === 'direct_reward' ? formData.reward : 0),
        penalty: taskType === 'direct_penalty' ? formData.penalty : formData.penalty,
        requiresApproval: taskType === 'approval',
        parentId: currentUser?.id,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        toast.error('创建任务失败');
        setSubmitting(false);
        return;
      }

      toast.success('任务已发布！');
      router.push('/parent/tasks');
    } catch (error) {
      toast.error('创建任务出错');
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
          <Link href="/parent/tasks" className="text-2xl hover:opacity-70">
            ←
          </Link>
          <h1 className="text-2xl font-bold text-foreground">发布新任务</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Type Selection */}
          <Card className="p-6 bg-white">
            <Label className="text-base font-semibold mb-4 block">任务类型</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/5 cursor-pointer">
                <input
                  type="radio"
                  value="approval"
                  checked={taskType === 'approval'}
                  onChange={(e) => setTaskType(e.target.value as typeof taskType)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-foreground">需要审批的任务</p>
                  <p className="text-sm text-muted-foreground">
                    孩子完成后需要你审批并给予奖励
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/5 cursor-pointer">
                <input
                  type="radio"
                  value="direct_reward"
                  checked={taskType === 'direct_reward'}
                  onChange={(e) => setTaskType(e.target.value as typeof taskType)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-foreground">直接奖励</p>
                  <p className="text-sm text-muted-foreground">
                    直接给孩子奖励星星
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-secondary/5 cursor-pointer">
                <input
                  type="radio"
                  value="direct_penalty"
                  checked={taskType === 'direct_penalty'}
                  onChange={(e) => setTaskType(e.target.value as typeof taskType)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-foreground">直接扣除</p>
                  <p className="text-sm text-muted-foreground">
                    直接扣除孩子的星星
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Task Details */}
          <Card className="p-6 bg-white space-y-4">
            <div>
              <Label htmlFor="title" className="block mb-2">
                任务标题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="例如：做完作业、整理房间"
                value={formData.title}
                onChange={handleChange}
                className="text-lg py-6"
              />
            </div>

            <div>
              <Label htmlFor="description" className="block mb-2">
                任务描述
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="详细描述任务内容"
                value={formData.description}
                onChange={handleChange}
                className="min-h-32"
              />
            </div>

            {(taskType === 'approval' || taskType === 'direct_reward') && (
              <div>
                <Label htmlFor="reward" className="block mb-2">
                  奖励星数 <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reward"
                    name="reward"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.reward}
                    onChange={handleChange}
                    className="text-lg py-6"
                  />
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            )}

            {taskType === 'direct_penalty' && (
              <div>
                <Label htmlFor="penalty" className="block mb-2">
                  扣除星数 <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="penalty"
                    name="penalty"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.penalty}
                    onChange={handleChange}
                    className="text-lg py-6"
                  />
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/parent/tasks" className="flex-1">
              <Button variant="outline" className="w-full py-6 bg-transparent" disabled={submitting}>
                取消
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 py-6 text-lg"
              disabled={submitting}
            >
              {submitting ? '发布中...' : '发布任务'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
