import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');
    const transactionType = searchParams.get('type');
    const limit = searchParams.get('limit');

    let transactions;
    
    if (childId && transactionType) {
      transactions = await sql`SELECT * FROM star_transactions WHERE child_id = ${parseInt(childId)} AND transaction_type = ${transactionType} ORDER BY created_at DESC ${limit ? sql`LIMIT ${parseInt(limit)}` : sql``}`;
    } else if (childId) {
      transactions = await sql`SELECT * FROM star_transactions WHERE child_id = ${parseInt(childId)} ORDER BY created_at DESC ${limit ? sql`LIMIT ${parseInt(limit)}` : sql``}`;
    } else if (transactionType) {
      transactions = await sql`SELECT * FROM star_transactions WHERE transaction_type = ${transactionType} ORDER BY created_at DESC ${limit ? sql`LIMIT ${parseInt(limit)}` : sql``}`;
    } else {
      transactions = await sql`SELECT * FROM star_transactions ORDER BY created_at DESC ${limit ? sql`LIMIT ${parseInt(limit)}` : sql``}`;
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json(
      { error: '获取交易记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      child_id,
      parent_id,
      transaction_type,
      amount,
      reference_type,
      reference_id,
      description
    } = data;

    if (!child_id || !transaction_type || amount === undefined) {
      return NextResponse.json(
        { error: '缺少必填字段: child_id, transaction_type, amount' },
        { status: 400 }
      );
    }

    // Get child's current balance
    const childResult = await sql`SELECT * FROM users WHERE id = ${child_id} AND user_type = 'child'`;
    if (childResult.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    const child = childResult[0];
    const newBalance = child.star_balance + amount;

    // Update child's star balance
    if (amount > 0) {
      await sql`
        UPDATE users 
        SET star_balance = star_balance + ${amount}, 
            total_earned = total_earned + ${amount},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${child_id}
      `;
    } else {
      await sql`
        UPDATE users 
        SET star_balance = star_balance + ${amount}, 
            total_spent = total_spent + ${Math.abs(amount)},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${child_id}
      `;
    }

    // Create transaction record
    const result = await sql`
      INSERT INTO star_transactions (child_id, parent_id, transaction_type, amount, reference_type, reference_id, description, balance_after)
      VALUES (${child_id}, ${parent_id || null}, ${transaction_type}, ${amount}, ${reference_type || null}, ${reference_id || null}, ${description || null}, ${newBalance})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      transaction: result[0]
    });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json(
      { error: '创建交易记录失败' },
      { status: 500 }
    );
  }
}
