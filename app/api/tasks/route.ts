import { NextRequest, NextResponse } from 'next/server';
import { TaskStore, UserStore, TransactionStore, Task, StarTransaction } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');
    const childId = searchParams.get('childId');

    let tasks = TaskStore.getAll();
    
    if (parentId) {
      tasks = TaskStore.getByParent(parentId);
    } else if (childId) {
      tasks = TaskStore.getByChild(childId);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: '获取任务失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: data.title,
      description: data.description || '',
      reward: data.reward || 0,
      penalty: data.penalty,
      requiresApproval: data.requiresApproval || true,
      parentId: data.parentId,
      childId: data.childId,
      status: 'pending',
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = TaskStore.create(newTask);
    return NextResponse.json(
      { success: true, task: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: '创建任务失败' },
      { status: 500 }
    );
  }
}
