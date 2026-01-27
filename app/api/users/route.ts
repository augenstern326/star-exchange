import { NextRequest, NextResponse } from 'next/server';
import { UserStore, User } from '@/lib/data-store';

export async function GET() {
  try {
    const users = UserStore.getAll();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: '获取用户失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      isParent: data.isParent || false,
      totalStars: data.isParent ? 0 : (data.totalStars || 0),
      childName: data.childName,
      createdAt: new Date(),
    };

    const created = UserStore.create(newUser);
    const { password: _, ...userWithoutPassword } = created;
    
    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  }
}
