import { NextResponse } from 'next/server';

// This endpoint is deprecated - database initialization should be done manually via SQL
export async function POST() {
  return NextResponse.json({
    message: 'Database initialization is deprecated. Please initialize the database manually by executing the SQL scripts.',
    deprecated: true,
  }, { status: 200 });
}
