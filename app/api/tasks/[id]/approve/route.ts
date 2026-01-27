import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = parseInt(params.id);
    const { approved } = await request.json();

    const taskResult = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;
    if (taskResult.length === 0) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    const task = taskResult[0];

    if (approved) {
      // Approve the task and award stars
      await sql`
        UPDATE tasks 
        SET status = 'approved', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${taskId}
      `;
      
      if (task.child_id && task.reward_stars > 0) {
        // Update child's star balance
        await sql`
          UPDATE users 
          SET star_balance = star_balance + ${task.reward_stars}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${task.child_id}
        `;
        
        // Record transaction
        await sql`
          INSERT INTO star_transactions (child_id, parent_id, transaction_type, amount, reference_type, reference_id, description)
          VALUES (${task.child_id}, ${task.parent_id}, 'task_approved', ${task.reward_stars}, 'task', ${taskId}, ${'任务奖励: ' + task.title})
        `;
      }
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
