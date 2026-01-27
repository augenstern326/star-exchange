import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');
    const childId = searchParams.get('childId');
    const status = searchParams.get('status');

    let tasks;
    
    if (parentId && status) {
      tasks = await sql`SELECT * FROM tasks WHERE parent_id = ${parseInt(parentId)} AND status = ${status} ORDER BY created_at DESC`;
    } else if (parentId) {
      tasks = await sql`SELECT * FROM tasks WHERE parent_id = ${parseInt(parentId)} ORDER BY created_at DESC`;
    } else if (childId && status) {
      tasks = await sql`SELECT * FROM tasks WHERE child_id = ${parseInt(childId)} AND status = ${status} ORDER BY created_at DESC`;
    } else if (childId) {
      tasks = await sql`SELECT * FROM tasks WHERE child_id = ${parseInt(childId)} ORDER BY created_at DESC`;
    } else if (status) {
      tasks = await sql`SELECT * FROM tasks WHERE status = ${status} ORDER BY created_at DESC`;
    } else {
      tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: '获取任务失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      parent_id,
      child_id,
      title,
      description,
      image_url,
      reward_stars,
      task_type = 'normal',
      status = 'pending',
      requires_approval = true,
      deadline_at,
      notes
    } = data;

    if (!parent_id || !title || reward_stars === undefined) {
      return NextResponse.json(
        { error: '缺少必填字段: parent_id, title, reward_stars' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO tasks (parent_id, child_id, title, description, image_url, reward_stars, task_type, status, requires_approval, deadline_at, notes)
      VALUES (${parent_id}, ${child_id || null}, ${title}, ${description || null}, ${image_url || null}, ${reward_stars}, ${task_type}, ${status}, ${requires_approval}, ${deadline_at || null}, ${notes || null})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      task: result[0]
    });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: '创建任务失败' },
      { status: 500 }
    );
  }
}
