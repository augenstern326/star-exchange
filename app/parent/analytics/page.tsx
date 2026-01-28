'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // 假设你有Button组件
import { Filter } from 'lucide-react'; // 或者使用其他图标库

interface Transaction {
  id: string;
  amount: number;
  type: 'task_approved' | 'manual_add' | 'manual_deduct' | 'exchange';
  description: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  star_balance: number;
}

// 筛选类型
type FilterType = 'all' | Transaction['type'];

export default function History() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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

    // Fetch transactions
    fetchTransactions(user.id);
  }, [router]);

  useEffect(() => {
    // 当transactions或筛选条件变化时，更新筛选后的交易
    if (activeFilter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
          transactions.filter((transaction) => transaction.type === activeFilter)
      );
    }
  }, [transactions, activeFilter]);

  const fetchTransactions = async (userId: string) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task_approved':
        return '任务奖励';
      case 'manual_add':
        return '家长奖励';
      case 'manual_deduct':
        return '家长扣除';
      case 'exchange':
        return '商品兑换';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    if (type === 'task_reward' || type === 'direct_reward') return 'default';
    if (type === 'exchange') return 'secondary';
    return 'destructive';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_approved':
        return '✓';
      case 'manual_add':
        return '💝';
      case 'exchange':
        return '🎁';
      case 'manual_deduct':
        return '✕';
      default:
        return '⭐';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;

  };

  // 计算筛选后的统计
  const totalIncome = filteredTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = Math.abs(
      filteredTransactions
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0)
  );

  // 筛选选项
  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部类型' },
    { value: 'task_approved', label: '任务奖励' },
    { value: 'manual_add', label: '家长奖励' },
    { value: 'manual_deduct', label: '家长扣除' },
    { value: 'exchange', label: '商品兑换' },
  ];

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
            <Link href="/parent/dashboard" className="flex items-center gap-2 hover:opacity-70">
              <span className="text-2xl">←</span>
              <h1 className="text-xl font-bold text-foreground">积分记录</h1>
            </Link>
            <div className="flex items-center gap-4">
              {/* 筛选按钮 */}
              <div className="relative">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <Filter size={16} />
                  筛选
                  {activeFilter !== 'all' && (
                      <Badge variant="secondary" className="ml-1">
                        {filterOptions.find(opt => opt.value === activeFilter)?.label}
                      </Badge>
                  )}
                </Button>

                {/* 筛选下拉菜单 */}
                {showFilterDropdown && (
                    <>
                      <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowFilterDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                        <div className="p-2">
                          <p className="text-sm font-medium text-gray-500 px-2 py-1">筛选类型</p>
                          {filterOptions.map((option) => (
                              <button
                                  key={option.value}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${
                                      activeFilter === option.value
                                          ? 'bg-primary/10 text-primary font-medium'
                                          : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => {
                                    setActiveFilter(option.value);
                                    setShowFilterDropdown(false);
                                  }}
                              >
                                <span>{option.label}</span>
                                {activeFilter === option.value && (
                                    <span className="text-primary">✓</span>
                                )}
                              </button>
                          ))}
                        </div>
                      </div>
                    </>
                )}
              </div>

              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Image src="/star.png" alt="星星" width={24} height={24} />
                <span className="font-bold text-primary text-lg">
                {currentUser?.star_balance}
              </span>
              </div>
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
              {activeFilter !== 'all' && (
                  <p className="text-xs text-gray-500 mt-1">筛选后统计</p>
              )}
            </Card>

            <Card className="p-4 bg-white text-center">
              <p className="text-muted-foreground text-sm mb-2">本期支出</p>
              <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-red-600">
                -{totalExpense}
              </span>
                <Image src="/star.png" alt="星星" width={32} height={32} />
              </div>
              {activeFilter !== 'all' && (
                  <p className="text-xs text-gray-500 mt-1">筛选后统计</p>
              )}
            </Card>

            <Card className="p-4 bg-gradient-to-r from-primary to-primary/80 text-white text-center">
              <p className="text-white/90 text-sm mb-2">当前余额</p>
              <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold">
                {totalIncome - totalExpense}
              </span>
                <Image src="/star.png" alt="星星" width={32} height={32} />
              </div>
              {activeFilter !== 'all' && (
                  <p className="text-xs text-white/80 mt-1">筛选后统计</p>
              )}
            </Card>
          </div>

          {/* 筛选状态提示 */}
          {activeFilter !== 'all' && (
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {filterOptions.find(opt => opt.value === activeFilter)?.label}
                  </Badge>
                  <span className="text-sm text-gray-600">
                共 {filteredTransactions.length} 条记录
              </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                >
                  清除筛选
                </Button>
              </div>
          )}

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
              <Card className="p-12 text-center bg-white">
                <div className="text-5xl mb-4">📜</div>
                <p className="text-lg text-foreground font-semibold">
                  {activeFilter === 'all' ? '暂无交易记录' : '暂无此类交易记录'}
                </p>
                <p className="text-muted-foreground mt-2">
                  {activeFilter === 'all'
                      ? '完成任务或兑换礼物后会显示在这里'
                      : '尝试选择其他筛选条件'}
                </p>
                {activeFilter !== 'all' && (
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveFilter('all')}
                    >
                      查看全部记录
                    </Button>
                )}
              </Card>
          ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
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
                              {formatDate(transaction.created_at)}
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