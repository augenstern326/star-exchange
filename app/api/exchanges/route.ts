import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');
    const status = searchParams.get('status');

    let exchanges;
    
    if (childId && status) {
      exchanges = await sql`SELECT e.*, p.name as product_name, p.image_url as product_image FROM exchanges e LEFT JOIN products p ON e.product_id = p.id WHERE e.child_id = ${parseInt(childId)} AND e.status = ${status} ORDER BY e.created_at DESC`;
    } else if (childId) {
      exchanges = await sql`SELECT e.*, p.name as product_name, p.image_url as product_image FROM exchanges e LEFT JOIN products p ON e.product_id = p.id WHERE e.child_id = ${parseInt(childId)} ORDER BY e.created_at DESC`;
    } else if (status) {
      exchanges = await sql`SELECT e.*, p.name as product_name, p.image_url as product_image FROM exchanges e LEFT JOIN products p ON e.product_id = p.id WHERE e.status = ${status} ORDER BY e.created_at DESC`;
    } else {
      exchanges = await sql`SELECT e.*, p.name as product_name, p.image_url as product_image FROM exchanges e LEFT JOIN products p ON e.product_id = p.id ORDER BY e.created_at DESC`;
    }

    return NextResponse.json(exchanges);
  } catch (error) {
    console.error('Failed to fetch exchanges:', error);
    return NextResponse.json(
      { error: '获取兑换记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { child_id, product_id, quantity = 1, notes } = data;

    if (!child_id || !product_id) {
      return NextResponse.json(
        { error: '缺少必填字段: child_id, product_id' },
        { status: 400 }
      );
    }

    // Get product info
    const productResult = await sql`SELECT * FROM products WHERE id = ${product_id} AND is_active = true`;
    if (productResult.length === 0) {
      return NextResponse.json(
        { error: '商品不存在或已下架' },
        { status: 404 }
      );
    }
    const product = productResult[0];

    // Check stock
    if (product.stock_quantity < quantity) {
      return NextResponse.json(
        { error: '商品库存不足' },
        { status: 400 }
      );
    }

    // Get child's star balance
    const childResult = await sql`SELECT * FROM users WHERE id = ${child_id} AND user_type = 'child'`;
    if (childResult.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    const child = childResult[0];

    const totalCost = product.price_stars * quantity;

    if (child.star_balance < totalCost) {
      return NextResponse.json(
        { error: '星星余额不足' },
        { status: 400 }
      );
    }

    // Create exchange record
    const exchangeResult = await sql`
      INSERT INTO exchanges (child_id, product_id, stars_used, quantity, status, notes)
      VALUES (${child_id}, ${product_id}, ${totalCost}, ${quantity}, 'pending', ${notes || null})
      RETURNING *
    `;

    // Deduct stars from child
    await sql`
      UPDATE users 
      SET star_balance = star_balance - ${totalCost}, 
          total_spent = total_spent + ${totalCost},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${child_id}
    `;

    // Update product stock
    await sql`
      UPDATE products 
      SET stock_quantity = stock_quantity - ${quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${product_id}
    `;

    // Record transaction
    await sql`
      INSERT INTO star_transactions (child_id, parent_id, transaction_type, amount, reference_type, reference_id, description)
      VALUES (${child_id}, ${product.parent_id}, 'exchange', ${-totalCost}, 'exchange', ${exchangeResult[0].id}, ${'兑换商品: ' + product.name})
    `;

    return NextResponse.json({
      success: true,
      exchange: exchangeResult[0]
    });
  } catch (error) {
    console.error('Failed to create exchange:', error);
    return NextResponse.json(
      { error: '创建兑换失败' },
      { status: 500 }
    );
  }
}
