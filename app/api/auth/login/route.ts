import { NextRequest, NextResponse } from 'next/server';
import { UserStore } from '@/lib/data-store';
import { verifyPassword } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const { username, password, userType } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // Find user by username
    const user = UserStore.getByUsername(username);

    // Verify user exists, has correct type, and password matches
    if (!user || user.userType !== userType || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: '用户名、密码或身份类型错误' },
        { status: 401 }
      );
    }

    // Return user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
