import { NextRequest, NextResponse } from 'next/server';
import { TaskStore, UserStore, TransactionStore } from '@/lib/data-store';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const { approved } = await request.json();

    const task = TaskStore.getById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    if (approved) {
      // Approve the task and award stars
      TaskStore.update(taskId, { status: 'completed' });
      
      if (task.childId && task.reward > 0) {
        const user = UserStore.updateStars(task.childId, task.reward);
        
        // Record transaction
        TransactionStore.create({
          id: `trans_${Date.now()}`,
          userId: task.childId,
          amount: task.reward,
          type: 'task_reward',
          description: `完成任务: ${task.title}`,
          taskId: taskId,
          createdAt: new Date(),
        });
      }
    } else {
      // Reject the task
      TaskStore.update(taskId, { status: 'rejected' });
    }

    const updated = TaskStore.getById(taskId);
    return NextResponse.json({
      success: true,
      task: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: '任务审批失败' },
      { status: 500 }
    );
  }
}
