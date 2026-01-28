import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params:Promise<{ id: string }> }
) {
  try {
    const taskId = (await params).id;
    const { completed } = await request.json();

    const taskResult = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (taskResult.length === 0) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    const task = taskResult[0];

    if (completed) {
      // Approve the task and award stars
      await sql`
        UPDATE tasks 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${taskId}
      `;
    } else {
      // Reject the task
      await sql`
        UPDATE tasks 
        SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${taskId}
      `;
    }

    const updated = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    return NextResponse.json({
      success: true,
      task: updated[0],
    });
  } catch (error) {
    console.error('[v0] Failed to approve task:', error);
    return NextResponse.json(
      { error: '任务审批失败' },
      { status: 500 }
    );
  }
}
