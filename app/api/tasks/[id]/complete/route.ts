import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    const taskResult = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (taskResult.length === 0) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    const task = taskResult[0];

    if (task.status !== 'pending' && task.status !== 'in_progress') {
      return NextResponse.json(
        { error: '任务状态不允许完成操作' },
        { status: 400 }
      );
    }

    // Mark task as completed
    await sql`
      UPDATE tasks 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${taskId}
    `;

    // If the task doesn't require approval, automatically approve and award stars
    if (!task.requires_approval && task.child_id && task.reward_stars > 0) {
      await sql`
        UPDATE tasks 
        SET status = 'approved', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${taskId}
      `;

      // Update child's star balance
      await sql`
        UPDATE users 
        SET star_balance = star_balance + ${task.reward_stars}, 
            total_earned = total_earned + ${task.reward_stars},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${task.child_id}
      `;

      // Record transaction
      await sql`
        INSERT INTO star_transactions (child_id, parent_id, transaction_type, amount, reference_type, reference_id, description)
        VALUES (${task.child_id}, ${task.parent_id}, 'task_completed', ${task.reward_stars}, 'task', ${taskId}, ${'任务完成: ' + task.title})
      `;
    }

    const updated = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    
    return NextResponse.json({
      success: true,
      task: updated[0],
    });
  } catch (error) {
    console.error('Failed to complete task:', error);
    return NextResponse.json(
      { error: '完成任务失败' },
      { status: 500 }
    );
  }
}
