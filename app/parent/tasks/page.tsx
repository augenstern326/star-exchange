'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { message } from 'antd';
import { format, isBefore, startOfDay } from 'date-fns';
import { CalendarIcon, ListTodo, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Task, User, TaskFilter } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterTabs } from '@/components/shared/FilterTabs';
import { StatsCard } from '@/components/shared/StatsCard';
import { TaskListSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ParentTasks() {
    const { user, loading: authLoading } = useAuth({ requireParent: true, redirectTo: '/parent/login' });
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

    const fetchTasks = async (parentId: string) => {
        try {
            const response = await fetch(`/api/tasks?parentId=${parentId}`);
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            setTasks([]);
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

    const handleApprove = async (taskId: string) => {
        try {
            const response = await fetch(`/api/tasks/${taskId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: true }),
            });

            if (!response.ok) {
                message.error('审批失败');
                return;
            }

            message.success('任务已批准！');
            if (user) {
                fetchTasks(user.id);
            }
        } catch (error) {
            message.error('审批出错');
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
                message.error('拒绝失败');
                return;
            }

            message.error('任务已拒绝');
            if (user) {
                fetchTasks(user.id);
            }
        } catch (error) {
            message.error('操作出错');
        }
    };

    const getStatusLabel = (status: string, isExpired: boolean) => {
        if (isExpired) return '已过期';
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

    const getStatusColor = (status: string, isExpired: boolean) => {
        if (isExpired) return 'destructive' as const;
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

    // 格式化截止日期显示（只返回日期，不包含其他文字）
    const formatDeadline = (deadlineAt: string) => {
        return format(new Date(deadlineAt), 'yyyy年MM月dd日');
    };

    // 计算统计数据
    const stats = useMemo(() => {
        const total = tasks.length;
        const pending = tasks.filter(t => t.status === 'completed' || t.status === 'pending').length;
        const approved = tasks.filter(t => t.status === 'approved').length;
        const rejected = tasks.filter(t => t.status === 'rejected').length;
        const expired = tasks.filter(t => isTaskExpired(t.deadline_at) && t.status === 'pending').length;

        return { total, pending, approved, rejected, expired };
    }, [tasks]);

    // 筛选和搜索
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // 状态筛选
            if (filter === 'pending' && task.status !== 'completed' && task.status !== 'pending') return false;
            if (filter === 'approved' && task.status !== 'approved') return false;
            if (filter === 'rejected' && task.status !== 'rejected') return false;

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
        { value: 'pending', label: '待处理', count: stats.pending },
        { value: 'approved', label: '已完成', count: stats.approved },
        { value: 'rejected', label: '已拒绝', count: stats.rejected },
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
            <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
                {/* 统计卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <StatsCard
                        title="全部任务"
                        value={stats.total}
                        emoji="📋"
                    />
                    <StatsCard
                        title="待处理"
                        value={stats.pending}
                        emoji="⏳"
                    />
                    <StatsCard
                        title="已完成"
                        value={stats.approved}
                        emoji="✅"
                    />
                    <StatsCard
                        title="已拒绝"
                        value={stats.rejected}
                        emoji="❌"
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
                            {searchKeyword ? '🔍' : '📋'}
                        </div>
                        <p className="text-base md:text-lg text-foreground font-semibold">
                            {searchKeyword
                                ? '没有找到匹配的任务'
                                : filter === 'all'
                                ? '还没有任务'
                                : filter === 'pending'
                                ? '没有待处理的任务'
                                : filter === 'approved'
                                ? '还没有已完成的任务'
                                : '没有已拒绝的任务'}
                        </p>
                        <p className="text-sm md:text-base text-muted-foreground mt-2 mb-6">
                            {searchKeyword ? '试试其他关键词' : '点击下面的按钮发布新任务'}
                        </p>
                        {!searchKeyword && (
                            <Link href="/parent/tasks/create">
                                <Button>发布任务</Button>
                            </Link>
                        )}
                    </Card>
                ) : (
                    <div className="space-y-3 md:space-y-4">
                        {filteredTasks.map((task) => {
                            const isExpired = isTaskExpired(task.deadline_at);

                            return (
                                <Card
                                    key={task.id}
                                    className={`p-4 md:p-6 bg-white hover:shadow-md transition-shadow active:scale-[0.99] ${
                                        isExpired ? 'opacity-70' : ''
                                    }`}
                                >
                                    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <div className="flex items-start gap-2 mb-2">
                                                <h3 className={`text-base md:text-lg font-bold flex-1 ${
                                                    isExpired ? 'text-muted-foreground' : 'text-foreground'
                                                }`}>
                                                    {task.title}
                                                </h3>
                                                <Badge variant={getStatusColor(task.status, isExpired)} className="flex-shrink-0">
                                                    {getStatusLabel(task.status, isExpired)}
                                                </Badge>
                                            </div>
                                            <p className={`text-sm text-muted-foreground mb-3 ${
                                                isExpired ? 'line-through' : ''
                                            }`}>
                                                {task.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm mb-3">
                                                <span className="text-xl md:text-2xl">⭐</span>
                                                {task.reward >= 0 ? (
                                                    <span className="font-semibold text-foreground">
                                                        奖励 {task.reward} 颗星星
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-destructive">
                                                        扣除 {-task.reward} 颗星星
                                                    </span>
                                                )}
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

                                        <div className="md:col-span-1 flex md:flex-col gap-2 md:justify-start">
                                            {task.status === 'completed' && !isExpired && (
                                                <>
                                                    <Button
                                                        onClick={() => handleApprove(task.id)}
                                                        size="sm"
                                                        className="flex-1 md:w-full"
                                                    >
                                                        ✓ 批准
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleReject(task.id)}
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 md:w-full"
                                                    >
                                                        ✕ 拒绝
                                                    </Button>
                                                </>
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
