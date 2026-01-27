import { NextRequest, NextResponse } from 'next/server';
import { ProductStore } from '@/lib/data-store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const data = await request.json();

    const product = ProductStore.getById(productId);
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    const updated = ProductStore.update(productId, data);
    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: '更新商品失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
    const product = ProductStore.getById(productId);
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    ProductStore.delete(productId);
    return NextResponse.json({
      success: true,
      message: '商品已删除',
    });
  } catch (error) {
    return NextResponse.json(
      { error: '删除商品失败' },
      { status: 500 }
    );
  }
}
