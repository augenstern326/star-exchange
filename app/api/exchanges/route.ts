import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');

    let exchanges;
    
    if (childId) {
      exchanges = await sql`SELECT * FROM exchanges WHERE child_id = ${parseInt(childId)} ORDER BY created_at DESC`;
    } else {
      exchanges = await sql`SELECT * FROM exchanges ORDER BY created_at DESC`;
    }

    return NextResponse.json(exchanges);
  } catch (error) {
    console.error('[v0] Failed to fetch exchanges:', error);
    return NextResponse.json(
      { error: '获取兑换记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: '兑换创建已禁用。请使用对应的管理界面创建兑换。' },
    { status: 405 }
  );
}
