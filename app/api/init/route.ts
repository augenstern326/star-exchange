import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';

export async function POST() {
  try {
    console.log('[v0] Initializing database...');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100),
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) NOT NULL DEFAULT 'child' CHECK (user_type IN ('parent', 'child')),
        parent_id BIGINT,
        nickname VARCHAR(100),
        avatar_url VARCHAR(255),
        star_balance INT DEFAULT 0,
        total_earned INT DEFAULT 0,
        total_spent INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_user_type ON users(user_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_parent_id ON users(parent_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_username ON users(username);`;

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGSERIAL PRIMARY KEY,
        parent_id BIGINT NOT NULL,
        child_id BIGINT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        reward_stars INT NOT NULL,
        task_type VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (task_type IN ('normal', 'direct_reward', 'deduct')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
        requires_approval BOOLEAN DEFAULT TRUE,
        deadline_at TIMESTAMP,
        completed_at TIMESTAMP,
        approved_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_parent_child ON tasks(parent_id, child_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON tasks(created_at);`;

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id BIGSERIAL PRIMARY KEY,
        parent_id BIGINT NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        price_stars INT NOT NULL,
        stock_quantity INT DEFAULT 0,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_products_parent_id ON products(parent_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);`;

    // Create exchanges table
    await sql`
      CREATE TABLE IF NOT EXISTS exchanges (
        id BIGSERIAL PRIMARY KEY,
        child_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        stars_used INT NOT NULL,
        quantity INT DEFAULT 1,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_exchanges_child_id ON exchanges(child_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_exchanges_created_at ON exchanges(created_at);`;

    // Create star_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS star_transactions (
        id BIGSERIAL PRIMARY KEY,
        child_id BIGINT NOT NULL,
        parent_id BIGINT,
        transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('task_completed', 'task_approved', 'exchange', 'manual_add', 'manual_deduct')),
        amount INT NOT NULL,
        reference_type VARCHAR(50),
        reference_id BIGINT,
        description VARCHAR(500),
        balance_after INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_child ON star_transactions(child_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_type ON star_transactions(transaction_type);`;

    console.log('[v0] Tables created successfully');

    // Check if demo users exist
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;

    if (existingUsers[0].count === 0) {
      console.log('[v0] Adding demo users...');

      // Hash passwords
      const parentPassword = hashPassword('password123');
      const childPassword = hashPassword('child123');

      // Insert demo parent user
      const parentResult = await sql`
        INSERT INTO users (username, email, password_hash, user_type, nickname, star_balance)
        VALUES ('parent1', 'dad@example.com', ${parentPassword}, 'parent', '爸爸', 0)
        RETURNING id
      `;

      const parentId = parentResult[0].id;

      // Insert demo child user
      await sql`
        INSERT INTO users (username, email, password_hash, user_type, parent_id, nickname, star_balance)
        VALUES ('child1', 'child@example.com', ${childPassword}, 'child', ${parentId}, '小明', 50)
      `;

      console.log('[v0] Demo users created');
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    });
  } catch (error) {
    console.error('[v0] Initialization error:', error);
    return NextResponse.json(
      { error: 'Database initialization failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
