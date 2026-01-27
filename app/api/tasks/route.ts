import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');
    const childId = searchParams.get('childId');

    let tasks;
    
    if (parentId) {
      tasks = await sql`SELECT * FROM tasks WHERE parent_id = ${parseInt(parentId)} ORDER BY created_at DESC`;
    } else if (childId) {
      tasks = await sql`SELECT * FROM tasks WHERE child_id = ${parseInt(childId)} ORDER BY created_at DESC`;
    } else {
      tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[v0] Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: '获取任务失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, reward, penalty,requiresApproval, parentId} = await request.json();

    let tasks = await sql`INSERT INTO tasks (parent_id, child_id, title, description, reward,requires_approval)
                          VALUES (${parseInt(parentId)}, 2, ${title}, ${description}, ${reward}, ${requiresApproval});`;

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[v0] Failed to create tasks:', error);
    return NextResponse.json(
        { error: '获取任务失败' },
        { status: 500 }
    );
  }
}
