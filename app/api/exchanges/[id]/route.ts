import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exchangeId = parseInt(id);
    
    const result = await sql`
      SELECT e.*, p.name as product_name, p.image_url as product_image 
      FROM exchanges e 
      LEFT JOIN products p ON e.product_id = p.id 
      WHERE e.id = ${exchangeId}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: '兑换记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch exchange:', error);
    return NextResponse.json(
      { error: '获取兑换记录失败' },
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
    const exchangeId = parseInt(id);
    const data = await request.json();

    const exchange = await sql`SELECT * FROM exchanges WHERE id = ${exchangeId}`;
    if (exchange.length === 0) {
      return NextResponse.json(
        { error: '兑换记录不存在' },
        { status: 404 }
      );
    }

    const allowedFields = ['status', 'notes'];
    const updates: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (value === null) {
          updates.push(`${key} = NULL`);
        } else {
          updates.push(`${key} = '${String(value).replace(/'/g, "''")}'`);
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(exchange[0]);
    }

    const updateStr = updates.join(', ');
    const updated = await sql`
      UPDATE exchanges 
      SET ${sql.raw(updateStr)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${exchangeId}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      exchange: updated[0],
    });
  } catch (error) {
    console.error('Failed to update exchange:', error);
    return NextResponse.json(
      { error: '更新兑换记录失败' },
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
    const exchangeId = parseInt(id);
    
    const exchange = await sql`SELECT * FROM exchanges WHERE id = ${exchangeId}`;
    if (exchange.length === 0) {
      return NextResponse.json(
        { error: '兑换记录不存在' },
        { status: 404 }
      );
    }

    // Only allow deletion of pending exchanges
    if (exchange[0].status !== 'pending') {
      return NextResponse.json(
        { error: '只能删除待处理的兑换记录' },
        { status: 400 }
      );
    }

    // Refund stars to child
    await sql`
      UPDATE users 
      SET star_balance = star_balance + ${exchange[0].stars_used}, 
          total_spent = total_spent - ${exchange[0].stars_used},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${exchange[0].child_id}
    `;

    // Restore product stock
    await sql`
      UPDATE products 
      SET stock_quantity = stock_quantity + ${exchange[0].quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${exchange[0].product_id}
    `;

    await sql`DELETE FROM exchanges WHERE id = ${exchangeId}`;
    
    return NextResponse.json({
      success: true,
      message: '兑换记录已删除，星星已退还',
    });
  } catch (error) {
    console.error('Failed to delete exchange:', error);
    return NextResponse.json(
      { error: '删除兑换记录失败' },
      { status: 500 }
    );
  }
}
