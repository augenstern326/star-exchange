import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    return NextResponse.json(users);
  } catch (error) {
    console.error('[v0] Failed to fetch users:', error);
    return NextResponse.json(
      { error: '获取用户失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: '用户创建已禁用。请使用 SQL 脚本直接在数据库中创建用户。' },
    { status: 405 }
  );
}
