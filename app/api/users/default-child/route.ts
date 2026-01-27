import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Get the first child user from database
    const result = await sql`
      SELECT id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, created_at, updated_at
      FROM users
      WHERE user_type = 'child'
      ORDER BY created_at ASC
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: '没有找到小孩用户，请先在数据库中创建小孩用户' },
        { status: 404 }
      );
    }

    const user = result[0];
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      user_type: user.user_type,
      parent_id: user.parent_id,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      star_balance: user.star_balance,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error('[v0] Failed to fetch default child user:', error);
    return NextResponse.json(
      { error: '获取小孩数据失败' },
      { status: 500 }
    );
  }
}
