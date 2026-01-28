'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requiresApproval: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  isParent: boolean;
}

export default function ParentTasks() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
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
    fetchTasks(user.id);
  }, [router]);

  const fetchTasks = async (parentId: string) => {
    try {
      const response = await fetch(`/api/tasks?parentId=${parentId}`);
      const data = await response.json();
      console.log(data)
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });

      if (!response.ok) {
        alert('审批失败');
        return;
      }

      alert('任务已批准！');
      if (currentUser) {
        fetchTasks(currentUser.id);
      }
    } catch (error) {
      alert('审批出错');
    }
  };

  const handleReject = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      });

      if (!response.ok) {
        alert('拒绝失败');
        return;
      }

      alert('任务已拒绝');
      if (currentUser) {
        fetchTasks(currentUser.id);
      }
    } catch (error) {
      alert('操作出错');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'completed':
        return '待批准';
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary' as const;
      case 'completed':
      case 'approved':
        return 'default' as const;
      case 'rejected':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'completed' || task.status === 'pending';
    if (filter === 'approved')
      return  task.status === 'approved';
    return true;
  });

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/parent/dashboard" className="flex items-center gap-2 hover:opacity-70">
            <span className="text-2xl">←</span>
            <h1 className="text-xl font-bold text-foreground">任务管理</h1>
          </Link>
          <Link href="/parent/tasks/create">
            <Button size="sm">新建任务</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'approved'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setFilter(tab as typeof filter)}
              variant={filter === tab ? 'default' : 'outline'}
              className="whitespace-nowrap"
            >
              {tab === 'all'
                ? '全部任务'
                : tab === 'pending' || tab === 'completed'
                  ? '待处理'
                  : '已完成'}
            </Button>
          ))}
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg text-foreground font-semibold">
              {filter === 'all'
                ? '还没有任务'
                : filter === 'pending' || tab === 'completed'
                  ? '没有待处理的任务'
                  : '还没有已完成的任务'}
            </p>
            <p className="text-muted-foreground mt-2 mb-6">
              点击下面的按钮发布新任务
            </p>
            <Link href="/parent/tasks/create">
              <Button>发布任务</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="p-6 bg-white hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {task.title}
                      </h3>
                      <Badge color={getStatusColor(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <span className="text-2xl">⭐</span>
                      {(task.reward>=0) && (<span className="font-semibold">奖励 {task.reward}  颗星星</span>)}
                      {(task.reward<0) &&  (<span className="font-semibold">扣除 {-task.reward} 颗星星</span>)}
                    </div>
                  </div>

                  <div className="col-span-1">
                    {(task.status === 'completed')  && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(task.id)}
                          size="sm"
                          className="flex-1"
                        >
                          批准
                        </Button>
                        <Button
                          onClick={() => handleReject(task.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          拒绝
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
