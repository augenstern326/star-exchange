import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let transactions;
    
    transactions = await sql`SELECT * ,transaction_type type FROM star_transactions ORDER BY created_at DESC`;
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[v0] Failed to fetch transactions:', error);
    return NextResponse.json(
      { error: '获取交易记录失败' },
      { status: 500 }
    );
  }
}
