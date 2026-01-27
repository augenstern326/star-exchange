import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');

    let transactions;
    
    if (childId) {
      transactions = await sql`SELECT * FROM star_transactions WHERE child_id = ${parseInt(childId)} ORDER BY created_at DESC`;
    } else {
      transactions = await sql`SELECT * FROM star_transactions ORDER BY created_at DESC`;
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[v0] Failed to fetch transactions:', error);
    return NextResponse.json(
      { error: '获取交易记录失败' },
      { status: 500 }
    );
  }
}
