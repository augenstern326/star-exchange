import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const category = searchParams.get('category');

    let products;
    
    if (parentId && category) {
      if (includeInactive) {
        products = await sql`SELECT * FROM products WHERE parent_id = ${parseInt(parentId)} AND category = ${category} ORDER BY sort_order, created_at DESC`;
      } else {
        products = await sql`SELECT * FROM products WHERE parent_id = ${parseInt(parentId)} AND category = ${category} AND is_active = true ORDER BY sort_order, created_at DESC`;
      }
    } else if (parentId) {
      if (includeInactive) {
        products = await sql`SELECT * FROM products WHERE parent_id = ${parseInt(parentId)} ORDER BY sort_order, created_at DESC`;
      } else {
        products = await sql`SELECT * FROM products WHERE parent_id = ${parseInt(parentId)} AND is_active = true ORDER BY sort_order, created_at DESC`;
      }
    } else if (category) {
      if (includeInactive) {
        products = await sql`SELECT * FROM products WHERE category = ${category} ORDER BY sort_order, created_at DESC`;
      } else {
        products = await sql`SELECT * FROM products WHERE category = ${category} AND is_active = true ORDER BY sort_order, created_at DESC`;
      }
    } else {
      if (includeInactive) {
        products = await sql`SELECT * FROM products ORDER BY sort_order, created_at DESC`;
      } else {
        products = await sql`SELECT * FROM products WHERE is_active = true ORDER BY sort_order, created_at DESC`;
      }
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: '获取商品失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      parent_id,
      name,
      description,
      image_url,
      price_stars,
      stock_quantity = 0,
      category,
      is_active = true,
      sort_order = 0
    } = data;

    if (!parent_id || !name || price_stars === undefined) {
      return NextResponse.json(
        { error: '缺少必填字段: parent_id, name, price_stars' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO products (parent_id, name, description, image_url, price_stars, stock_quantity, category, is_active, sort_order)
      VALUES (${parent_id}, ${name}, ${description || null}, ${image_url || null}, ${price_stars}, ${stock_quantity}, ${category || null}, ${is_active}, ${sort_order})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      product: result[0]
    });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: '创建商品失败' },
      { status: 500 }
    );
  }
}
