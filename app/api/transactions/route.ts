import { NextRequest, NextResponse } from 'next/server';
import { TransactionStore } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let transactions = TransactionStore.getAll();
    
    if (userId) {
      transactions = TransactionStore.getByUser(userId);
    }

    // Sort by date descending
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: '获取交易记录失败' },
      { status: 500 }
    );
  }
}
