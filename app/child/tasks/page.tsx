'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { message } from 'antd';
import { format, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Task, User, TaskFilter } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterTabs } from '@/components/shared/FilterTabs';
import { StatsCard } from '@/components/shared/StatsCard';
import { TaskListSkeleton } from '@/components/shared/LoadingSkeleton';

export default function Tasks() {
  const { user, loading: authLoading, updateUser } = useAuth({ requireAuth: true, redirectTo: '/login' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const today = startOfDay(new Date());

  useEffect(() => {
    if (user) {
      fetchTasks(user.id);
    }
  }, [user]);

  const fetchTasks = async (userId: string) => {
    try {
      const response = await fetch(`/api/tasks?childId=${userId}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // 判断任务是否过期（只有有截止日期的任务才可能过期）
  const isTaskExpired = (deadlineAt: string | null) => {
    if (!deadlineAt) return false;
    const deadline = new Date(deadlineAt);
    const deadlineStartOfDay = startOfDay(deadline);
    return isBefore(deadlineStartOfDay, today);
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });

      if (!response.ok) {
        message.error('提交失败');
        return;
      }

      message.success('任务已提交，等待审批！');
      if (user) {
        fetchTasks(user.id);
      }
    } catch (error) {
      message.error('提交出错');
    }
  };

  const getStatusLabel = (status: string, isExpired: boolean) => {
    if (isExpired) return '已过期';
    switch (status) {
      case 'pending':
        return '待完成';
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

  const getStatusColor = (
      status: string,
      isExpired: boolean
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (isExpired) return 'destructive';
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

  // 获取卡片背景颜色类名（儿童友好设计）
  const getCardBackgroundClass = (status: string, isExpired: boolean) => {
    if (isExpired) return 'bg-gray-100'; // 已过期 - 浅灰色
    switch (status) {
      case 'pending':
        return 'bg-blue-50'; // 待完成 - 浅蓝色
      case 'completed':
        return 'bg-yellow-50'; // 待批准 - 浅黄色
      case 'approved':
        return 'bg-green-50'; // 已批准 - 浅绿色
      case 'rejected':
        return 'bg-red-50'; // 已拒绝 - 浅红色
      default:
        return 'bg-white';
    }
  };

  // 获取状态表情符号（儿童友好设计）
  const getStatusEmoji = (status: string, isExpired: boolean) => {
    if (isExpired) return '⏰'; // 已过期
    switch (status) {
      case 'pending':
        return '📝'; // 待完成
      case 'completed':
        return '⏳'; // 待批准
      case 'approved':
        return '✅'; // 已批准
      case 'rejected':
        return '❌'; // 已拒绝
      default:
        return '📋';
    }
  };

  // 格式化截止日期显示
  const formatDeadline = (deadlineAt: string) => {
    return format(new Date(deadlineAt), 'yyyy年MM月dd日');
  };

  // 计算统计数据
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const waitingApproval = tasks.filter(t => t.status === 'completed').length; // 待批准
    const approved = tasks.filter(t => t.status === 'approved').length;
    const totalReward = tasks
      .filter(t => t.status === 'approved')
      .reduce((sum, t) => sum + t.reward, 0);

    return { total, pending, waitingApproval, approved, totalReward };
  }, [tasks]);

  // 筛选和搜索
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 状态筛选
      if (filter === 'pending' && task.status !== 'pending') return false;
      if (filter === 'completed' && task.status !== 'completed') return false;
      if (filter === 'approved' && task.status !== 'approved') return false;

      // 搜索关键词
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        return (
          task.title.toLowerCase().includes(keyword) ||
          task.description.toLowerCase().includes(keyword)
        );
      }

      return true;
    });
  }, [tasks, filter, searchKeyword]);

  // 筛选选项
  const filterOptions = [
    { value: 'all', label: '全部任务', count: stats.total },
    { value: 'pending', label: '待完成', count: stats.pending },
    { value: 'completed', label: '待批准', count: stats.waitingApproval },
    { value: 'approved', label: '已批准', count: stats.approved },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-secondary/10 pb-20">
        <div className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <TaskListSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
            <div className="flex items-center gap-2 bg-primary/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
              <Image src="/star.png" alt="星星" width={20} height={20} className="md:w-6 md:h-6" />
              <span className="font-bold text-primary text-base md:text-lg">
                {user?.totalStars || user?.star_balance || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <StatsCard
              title="全部任务"
              value={stats.total}
              emoji="📋"
            />
            <StatsCard
              title="待完成"
              value={stats.pending}
              emoji="📝"
            />
            <StatsCard
              title="待批准"
              value={stats.waitingApproval}
              emoji="⏳"
            />
            <StatsCard
              title="已批准"
              value={stats.approved}
              emoji="✅"
            />
          </div>

          {/* 搜索栏 */}
          <SearchBar
            value={searchKeyword}
            onChange={setSearchKeyword}
            placeholder="搜索任务标题或描述..."
            className="mb-4"
          />

          {/* Filter Tabs */}
          <FilterTabs
            options={filterOptions}
            value={filter}
            onChange={(value) => setFilter(value as TaskFilter)}
            className="mb-6"
          />

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
              <Card className="p-8 md:p-12 text-center bg-white">
                <div className="text-4xl md:text-5xl mb-4">
                  {searchKeyword ? '🔍' : '✨'}
                </div>
                <p className="text-base md:text-lg text-foreground font-semibold">
                  {searchKeyword
                      ? '没有找到匹配的任务'
                      : filter === 'all'
                      ? '暂无任务'
                      : filter === 'pending'
                      ? '没有待完成的任务'
                      : '还没有完成任何任务'}
                </p>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  {searchKeyword ? '试试其他关键词' : '完成家长发布的任务就能赚取星星哦！'}
                </p>
              </Card>
          ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredTasks.map((task) => {
                  const isExpired = isTaskExpired(task.deadline_at);

                  return (
                      <Card
                          key={task.id}
                          className={`p-4 md:p-6 ${getCardBackgroundClass(task.status, isExpired)} hover:shadow-md transition-all active:scale-[0.99] ${
                              isExpired && task.status === 'pending' ? 'opacity-70' : ''
                          }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            {/* 大表情符号 - 儿童友好设计 */}
                            <div className="text-4xl md:text-5xl mb-3">
                              {getStatusEmoji(task.status, isExpired)}
                            </div>

                            <div className="flex items-start gap-2 mb-2">
                              <h3 className={`text-base md:text-lg font-bold flex-1 ${
                                  isExpired && task.status === 'pending'
                                      ? 'text-muted-foreground'
                                      : 'text-foreground'
                              }`}>
                                {task.title}
                              </h3>
                              <Badge variant={getStatusColor(task.status, isExpired)} className="flex-shrink-0">
                                {getStatusLabel(task.status, isExpired)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <Image
                                  src="/star.png"
                                  alt="星星"
                                  width={18}
                                  height={18}
                                  className="md:w-5 md:h-5"
                              />
                              <span className={`font-semibold text-sm md:text-base ${
                                task.reward >= 0 ? 'text-primary' : 'text-destructive'
                              }`}>
                                {task.reward >= 0 ? '+' : ''}{task.reward} 星星
                              </span>
                            </div>

                            {task.deadline_at && (
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                  <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-muted-foreground">截止：</span>
                                  <span className={
                                    isExpired
                                        ? 'text-destructive font-medium'
                                        : 'text-foreground font-medium'
                                  }>
                                    {formatDeadline(task.deadline_at)}
                                  </span>
                                </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="flex md:flex-col items-center md:items-end gap-2">
                            {task.status === 'pending' && !isExpired && (
                                <Button
                                    onClick={() => handleCompleteTask(task.id)}
                                    size="sm"
                                    className="w-full md:w-auto whitespace-nowrap"
                                >
                                  ✓ 完成任务
                                </Button>
                            )}
                            {task.status === 'approved' && (
                                <div className="flex items-center gap-1.5 bg-green-100 px-3 py-1.5 rounded-full">
                                  <span className="text-lg md:text-xl">✓</span>
                                  <span className="text-xs md:text-sm font-semibold text-green-700">
                                    已获得
                                  </span>
                                </div>
                            )}
                            {isExpired && task.status === 'pending' && (
                                <div className="text-xs md:text-sm text-destructive font-medium">
                                  任务已过期
                                </div>
                            )}
                          </div>
                        </div>
                      </Card>
                  );
                })}
              </div>
          )}
        </div>
      </div>
  );
}
