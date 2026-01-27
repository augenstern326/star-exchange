import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userType = searchParams.get('userType');
    const parentId = searchParams.get('parentId');

    let users;
    
    if (userType && parentId) {
      users = await sql`
        SELECT id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, total_earned, total_spent, is_active, created_at, updated_at
        FROM users
        WHERE user_type = ${userType} AND parent_id = ${parseInt(parentId)}
        ORDER BY created_at DESC
      `;
    } else if (userType) {
      users = await sql`
        SELECT id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, total_earned, total_spent, is_active, created_at, updated_at
        FROM users
        WHERE user_type = ${userType}
        ORDER BY created_at DESC
      `;
    } else if (parentId) {
      users = await sql`
        SELECT id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, total_earned, total_spent, is_active, created_at, updated_at
        FROM users
        WHERE parent_id = ${parseInt(parentId)}
        ORDER BY created_at DESC
      `;
    } else {
      users = await sql`
        SELECT id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, total_earned, total_spent, is_active, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: '获取用户失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      username,
      email,
      password,
      user_type = 'child',
      parent_id,
      nickname,
      avatar_url,
      star_balance = 0
    } = data;

    if (!username || !password) {
      return NextResponse.json(
        { error: '缺少必填字段: username, password' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    const result = await sql`
      INSERT INTO users (username, email, password_hash, user_type, parent_id, nickname, avatar_url, star_balance)
      VALUES (${username}, ${email || null}, ${password_hash}, ${user_type}, ${parent_id || null}, ${nickname || null}, ${avatar_url || null}, ${star_balance})
      RETURNING id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, total_earned, total_spent, is_active, created_at, updated_at
    `;

    return NextResponse.json({
      success: true,
      user: result[0]
    });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  }
}
