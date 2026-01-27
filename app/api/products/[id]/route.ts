import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const productId = (await params).id;
    const data = await request.json();

    const product = await sql`SELECT * FROM products WHERE id = ${productId}`;
    if (product.length === 0) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // Build the update query dynamically
    let newInventory = data.inventory;

    const updated = await sql`
      UPDATE products 
      SET inventory = ${newInventory}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      product: updated[0],
    });
  } catch (error) {
    console.error('[v0] Failed to update product:', error);
    return NextResponse.json(
      { error: '更新商品失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const productId = (await params).id;
    const product = await sql`SELECT * FROM products WHERE id = ${productId}`;
    if (product.length === 0) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    await sql`DELETE FROM products WHERE id = ${productId}`;
    return NextResponse.json({
      success: true,
      message: '商品已删除',
    });
  } catch (error) {
    console.error('[v0] Failed to delete product:', error);
    return NextResponse.json(
      { error: '删除商品失败' },
      { status: 500 }
    );
  }
}
