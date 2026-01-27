import { NextRequest, NextResponse } from 'next/server';
import { sql, initializeDatabase } from '@/lib/db';
import { verifyPassword } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    // Initialize database on first request
    await initializeDatabase();

    const { username, password, userType } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // Query user from database
    const users = await sql`
      SELECT id, username, email, password_hash, user_type, parent_id, nickname, avatar_url, star_balance
      FROM users
      WHERE username = ${username} AND user_type = ${userType}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: '用户名、密码或身份类型错误' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: '用户名、密码或身份类型错误' },
        { status: 401 }
      );
    }

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: {
        id: userWithoutPassword.id.toString(),
        username: userWithoutPassword.username,
        email: userWithoutPassword.email,
        userType: userWithoutPassword.user_type,
        parentId: userWithoutPassword.parent_id?.toString(),
        nickname: userWithoutPassword.nickname,
        avatarUrl: userWithoutPassword.avatar_url,
        totalStars: userWithoutPassword.star_balance,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
