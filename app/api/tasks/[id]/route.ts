import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    
    const result = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return NextResponse.json(
      { error: '获取任务失败' },
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
    const taskId = parseInt(id);
    const data = await request.json();

    const task = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (task.length === 0) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    const allowedFields = ['title', 'description', 'image_url', 'reward_stars', 'task_type', 'status', 'requires_approval', 'deadline_at', 'notes', 'child_id', 'completed_at'];
    const updates: string[] = [];
    const values: unknown[] = [];

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

    if (updates.length === 0) {
      return NextResponse.json(task[0]);
    }

    const updateStr = updates.join(', ');
    const updated = await sql`
      UPDATE tasks 
      SET ${sql.raw(updateStr)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      task: updated[0],
    });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { error: '更新任务失败' },
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
    const taskId = parseInt(id);
    
    const task = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (task.length === 0) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    await sql`DELETE FROM tasks WHERE id = ${taskId}`;
    
    return NextResponse.json({
      success: true,
      message: '任务已删除',
    });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json(
      { error: '删除任务失败' },
      { status: 500 }
    );
  }
}
