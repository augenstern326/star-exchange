import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {


   let tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;


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
    const result = await sql`
      SELECT id, username, email, user_type, parent_id, nickname, avatar_url, star_balance, created_at, updated_at
      FROM users
      WHERE user_type = 'child'
      ORDER BY created_at ASC
      LIMIT 1
    `;
    const user = result[0];
    const childId = user.id;
    const { title, description, reward, requiresApproval, parentId,deadline_at} = await request.json();
    if(requiresApproval==false){
      await sql`INSERT INTO tasks (parent_id, child_id, title, description,status, reward,requires_approval)
                          VALUES (${parseInt(parentId)}, ${parseInt(childId)}, ${title}, ${description}, 'approved',${reward}, ${requiresApproval});`;
      await sql`
          UPDATE users 
          SET star_balance = star_balance + ${reward}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${childId}
        `;

      await sql`
          INSERT INTO star_transactions (child_id, parent_id, transaction_type, amount, reference_type,  description)
          VALUES (${parseInt(childId)},${parseInt(parentId)}, ${reward>0?'manual_add':'manual_deduct'}, ${reward}, 'task', ${'直接奖励: ' + title})
        `;
    }else{
      await sql`INSERT INTO tasks (parent_id, child_id, title, description, reward,requires_approval,deadline_at)
                          VALUES (${parseInt(parentId)},${childId}, ${title}, ${description}, ${reward}, ${requiresApproval},${deadline_at});`;
    }


    return NextResponse.json(
        { ok: '创建任务成功'},
        { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Failed to create tasks:', error);
    return NextResponse.json(
        { error: '获取任务失败' },
        { status: 500 }
    );
  }
}
