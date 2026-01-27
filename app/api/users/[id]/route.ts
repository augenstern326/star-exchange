import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    const result = await sql`
      SELECT id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, total_earned, total_spent, is_active, created_at, updated_at
      FROM users 
      WHERE id = ${userId}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: '获取用户失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const data = await request.json();

    const user = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const allowedFields = ['email', 'nickname', 'avatar_url', 'star_balance', 'is_active'];
    const updates: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (value === null) {
          updates.push(`${key} = NULL`);
        } else if (typeof value === 'boolean') {
          updates.push(`${key} = ${value}`);
        } else if (typeof value === 'number') {
          updates.push(`${key} = ${value}`);
        } else {
          updates.push(`${key} = '${String(value).replace(/'/g, "''")}'`);
        }
      }
    }

    // Handle password update separately
    if (data.password) {
      const password_hash = await hashPassword(data.password);
      updates.push(`password_hash = '${password_hash}'`);
    }

    if (updates.length === 0) {
      return NextResponse.json(user[0]);
    }

    const updateStr = updates.join(', ');
    const updated = await sql`
      UPDATE users 
      SET ${sql.raw(updateStr)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, total_earned, total_spent, is_active, created_at, updated_at
    `;

    return NextResponse.json({
      success: true,
      user: updated[0],
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: '更新用户失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    const user = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (user.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    await sql`DELETE FROM users WHERE id = ${userId}`;
    
    return NextResponse.json({
      success: true,
      message: '用户已删除',
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: '删除用户失败' },
      { status: 500 }
    );
  }
}
