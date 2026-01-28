import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const childId = searchParams.get('childId');

    let exchanges;
    
    if (childId) {
      exchanges = await sql`SELECT * FROM exchanges WHERE child_id = ${parseInt(childId)} ORDER BY created_at DESC`;
    } else {
      exchanges = await sql`SELECT * FROM exchanges ORDER BY created_at DESC`;
    }

    return NextResponse.json(exchanges);
  } catch (error) {
    console.error('[v0] Failed to fetch exchanges:', error);
    return NextResponse.json(
      { error: '获取兑换记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {


    const {userId, price,productId, productName,quantity} = await request.json();
    await sql`INSERT INTO exchanges (child_id,product_id,product_name,stars_used,quantity,status) values(${userId},${productId},${productName},${price},${quantity},'completed') `;
    await sql`
      UPDATE users
      SET star_balance = star_balance - ${price}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;
    await sql`UPDATE products SET inventory = inventory-${quantity} WHERE id = ${productId}`;
    await sql`
          INSERT INTO star_transactions (child_id, parent_id, transaction_type, amount, reference_type, reference_id, description)
          VALUES (${userId}, null, 'exchange', ${-price}, 'task', null, ${'积分兑换: ' + productName})
        `;
    return NextResponse.json( { ok: '兑换成功' },
        { status: 200 });
  } catch (error) {
    console.error('[v0] Failed to create exchanges:', error);
    return NextResponse.json(
        { error: '获取兑换记录失败' },
        { status: 500 }
    );
  }
}
