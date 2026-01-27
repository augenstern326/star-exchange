import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Database initialization function
export async function initializeDatabase() {
  try {
    // Check if users table exists
    const result = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;

    if (!result[0].exists) {
      console.log('[v0] Creating database tables...');
      
      // Create users table
      await sql`
        CREATE TABLE users (
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
      await sql`CREATE INDEX idx_user_type ON users(user_type);`;
      await sql`CREATE INDEX idx_parent_id ON users(parent_id);`;
      await sql`CREATE INDEX idx_username ON users(username);`;

      // Create tasks table
      await sql`
        CREATE TABLE tasks (
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

      await sql`CREATE INDEX idx_parent_child ON tasks(parent_id, child_id);`;
      await sql`CREATE INDEX idx_status ON tasks(status);`;
      await sql`CREATE INDEX idx_created_at ON tasks(created_at);`;

      // Create products table
      await sql`
        CREATE TABLE products (
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

      await sql`CREATE INDEX idx_products_parent_id ON products(parent_id);`;
      await sql`CREATE INDEX idx_products_is_active ON products(is_active);`;

      // Create exchanges table
      await sql`
        CREATE TABLE exchanges (
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

      await sql`CREATE INDEX idx_exchanges_child_id ON exchanges(child_id);`;
      await sql`CREATE INDEX idx_exchanges_created_at ON exchanges(created_at);`;

      // Create star_transactions table
      await sql`
        CREATE TABLE star_transactions (
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

      await sql`CREATE INDEX idx_transactions_child ON star_transactions(child_id);`;
      await sql`CREATE INDEX idx_transactions_type ON star_transactions(transaction_type);`;

      console.log('[v0] Database tables created successfully');
    }

    return true;
  } catch (error) {
    console.error('[v0] Database initialization error:', error);
    throw error;
  }
}
