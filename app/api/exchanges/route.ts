import { NextRequest, NextResponse } from 'next/server';
import { ExchangeStore, ProductStore, UserStore, TransactionStore, Exchange } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let exchanges = ExchangeStore.getAll();
    
    if (userId) {
      exchanges = ExchangeStore.getByUser(userId);
    }

    return NextResponse.json(exchanges);
  } catch (error) {
    return NextResponse.json(
      { error: '获取兑换记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, productId, quantity } = data;

    // Get product
    const product = ProductStore.getById(productId);
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // Check inventory
    if (product.inventory < quantity) {
      return NextResponse.json(
        { error: '库存不足' },
        { status: 400 }
      );
    }

    // Get user
    const user = UserStore.getById(userId);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // Calculate total cost
    const totalCost = product.price * quantity;

    // Check user stars
    if (user.totalStars < totalCost) {
      return NextResponse.json(
        { error: '星星不足' },
        { status: 400 }
      );
    }

    // Create exchange
    const newExchange: Exchange = {
      id: `exch_${Date.now()}`,
      productId,
      userId,
      quantity,
      totalCost,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = ExchangeStore.create(newExchange);

    // Deduct stars
    UserStore.updateStars(userId, -totalCost);

    // Record transaction
    TransactionStore.create({
      id: `trans_${Date.now()}`,
      userId,
      amount: -totalCost,
      type: 'exchange',
      description: `兑换商品: ${product.name}`,
      exchangeId: created.id,
      createdAt: new Date(),
    });

    // Update product inventory
    ProductStore.update(productId, {
      inventory: product.inventory - quantity,
    });

    return NextResponse.json(
      { success: true, exchange: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: '创建兑换失败' },
      { status: 500 }
    );
  }
}
