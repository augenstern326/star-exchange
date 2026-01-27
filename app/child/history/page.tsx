'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  amount: number;
  type: 'task_reward' | 'task_penalty' | 'direct_reward' | 'direct_penalty' | 'exchange';
  description: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  totalStars: number;
}

export default function History() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    
    // Fetch transactions
    fetchTransactions(user.id);
  }, [router]);

  const fetchTransactions = async (userId: string) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Mock data
      setTransactions([
        {
          id: 'trans1',
          amount: 10,
          type: 'task_reward',
          description: '完成任务: 做完作业',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'trans2',
          amount: -20,
          type: 'exchange',
          description: '兑换商品: 小玩具车',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: 'trans3',
          amount: 5,
          type: 'direct_reward',
          description: '家长奖励',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task_reward':
        return '任务奖励';
      case 'task_penalty':
        return '任务扣除';
      case 'direct_reward':
        return '家长奖励';
      case 'direct_penalty':
        return '家长扣除';
      case 'exchange':
        return '商品兑换';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    if (type.includes('reward') || type === 'task_reward')
      return 'default';
    if (type === 'exchange') return 'secondary';
    return 'destructive';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_reward':
        return '✓';
      case 'direct_reward':
        return '💝';
      case 'exchange':
        return '🎁';
      case 'task_penalty':
      case 'direct_penalty':
        return '✕';
      default:
        return '⭐';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

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
            <h1 className="text-xl font-bold text-foreground">消费记录</h1>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-white text-center">
            <p className="text-muted-foreground text-sm mb-2">本期收入</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-green-600">
                +{totalIncome}
              </span>
              <Image src="/star.png" alt="星星" width={32} height={32} />
            </div>
          </Card>

          <Card className="p-4 bg-white text-center">
            <p className="text-muted-foreground text-sm mb-2">本期支出</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-red-600">
                -{totalExpense}
              </span>
              <Image src="/star.png" alt="星星" width={32} height={32} />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-primary to-primary/80 text-white text-center">
            <p className="text-white/90 text-sm mb-2">当前余额</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold">
                {currentUser?.totalStars}
              </span>
              <Image src="/star.png" alt="星星" width={32} height={32} />
            </div>
          </Card>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <div className="text-5xl mb-4">📜</div>
            <p className="text-lg text-foreground font-semibold">
              暂无交易记录
            </p>
            <p className="text-muted-foreground mt-2">
              完成任务或兑换礼物后会显示在这里
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Icon and Description */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-3xl flex-shrink-0">
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount and Badge */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          transaction.amount > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount}
                      </p>
                    </div>
                    <Badge color={getTypeColor(transaction.type)}>
                      {getTypeLabel(transaction.type)}
                    </Badge>
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
