import { NextRequest, NextResponse } from 'next/server';
import { ProductStore, Product } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');

    let products = ProductStore.getAll();
    
    if (parentId) {
      products = ProductStore.getByParent(parentId);
    }

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: '获取商品失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: data.name,
      description: data.description || '',
      price: data.price,
      inventory: data.inventory || 0,
      image: data.image,
      parentId: data.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = ProductStore.create(newProduct);
    return NextResponse.json(
      { success: true, product: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: '创建商品失败' },
      { status: 500 }
    );
  }
}
