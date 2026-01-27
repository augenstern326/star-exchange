'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  dueDate?: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  totalStars: number;
}

export default function Tasks() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    // Fetch tasks
    fetchTasks(user.id);
  }, [router]);

  const fetchTasks = async (userId: string) => {
    try {
      const response = await fetch(`/api/tasks?childId=${userId}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // Mock data
      setTasks([
        {
          id: 'task1',
          title: '做完作业',
          description: '完成今天的数学作业',
          reward: 10,
          status: 'pending',
          requiresApproval: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task2',
          title: '整理房间',
          description: '把房间收拾干净',
          reward: 5,
          status: 'pending',
          requiresApproval: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });

      if (!response.ok) {
        toast.error('提交失败');
        return;
      }

      toast.success('任务已提交，等待审批！');
      if (currentUser) {
        fetchTasks(currentUser.id);
      }
    } catch (error) {
      toast.error('提交出错');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '待完成';
      case 'completed':
        return '已完成';
      case 'approved':
        return '已批准';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  };

  const getStatusColor = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'completed':
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed')
      return task.status === 'completed' || task.status === 'approved';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 flex items-center justify-center">
        <p className="text-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70">
            <span className="text-2xl">←</span>
            <h1 className="text-xl font-bold text-foreground">星星任务</h1>
          </Link>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Image src="/star.png" alt="星星" width={24} height={24} />
            <span className="font-bold text-primary text-lg">
              {currentUser?.totalStars}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'completed'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setFilter(tab as typeof filter)}
              variant={filter === tab ? 'default' : 'outline'}
              className="whitespace-nowrap"
            >
              {tab === 'all'
                ? '全部任务'
                : tab === 'pending'
                  ? '待完成'
                  : '已完成'}
            </Button>
          ))}
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-lg text-foreground font-semibold">
              {filter === 'all'
                ? '暂无任务'
                : filter === 'pending'
                  ? '没有待完成的任务'
                  : '还没有完成任何任务'}
            </p>
            <p className="text-muted-foreground mt-2">
              完成家长发布的任务就能赚取星星哦！
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {task.title}
                      </h3>
                      <Badge color={getStatusColor(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/star.png"
                          alt="星星"
                          width={20}
                          height={20}
                        />
                        <span className="font-semibold text-primary">
                          +{task.reward} 星星
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {task.status === 'pending' && (
                    <Button
                      onClick={() => handleCompleteTask(task.id)}
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      完成任务
                    </Button>
                  )}
                  {task.status === 'approved' && (
                    <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                      <span className="text-2xl">✓</span>
                      <span className="text-sm font-semibold text-green-700">
                        已获得
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
