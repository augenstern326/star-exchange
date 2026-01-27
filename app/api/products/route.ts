import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');

    let products;
    
    if (parentId) {
      products = await sql`SELECT * FROM products WHERE parent_id = ${parseInt(parentId)} AND is_active = true ORDER BY sort_order, created_at DESC`;
    } else {
      products = await sql`SELECT * FROM products WHERE is_active = true ORDER BY sort_order, created_at DESC`;
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('[v0] Failed to fetch products:', error);
    return NextResponse.json(
      { error: '获取商品失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: '商品创建已禁用。请使用对应的管理界面创建商品。' },
    { status: 405 }
  );
}
