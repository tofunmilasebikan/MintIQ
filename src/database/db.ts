import { Expense, ExpenseInput, Goal, GoalInput } from '../types';

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as number,
    amount: row.amount as number,
    category: row.category as Expense['category'],
    date: row.date as string,
    merchant: (row.merchant as string) ?? null,
    note: (row.note as string) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as number,
    name: row.name as string,
    targetAmount: row.target_amount as number,
    currentAmount: row.current_amount as number,
    goalType: row.goal_type as Goal['goalType'],
    category: (row.category as Goal['category']) ?? null,
    month: row.month as string,
    status: row.status as Goal['status'],
    recurrence: row.recurrence as Goal['recurrence'],
    linkSavingsTransactions: Boolean(row.link_savings_transactions),
    createdAt: row.created_at as string,
  };
}

export async function initDatabase(db: import('expo-sqlite').SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      merchant TEXT,
      note TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      goal_type TEXT NOT NULL,
      category TEXT,
      month TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      recurrence TEXT NOT NULL DEFAULT 'monthly',
      link_savings_transactions INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    CREATE INDEX IF NOT EXISTS idx_goals_month ON goals(month);
  `);
}

export async function getSetting(
  db: import('expo-sqlite').SQLiteDatabase,
  key: string
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setSetting(
  db: import('expo-sqlite').SQLiteDatabase,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

// --- Expenses ---

export async function getAllExpenses(db: import('expo-sqlite').SQLiteDatabase): Promise<Expense[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM expenses ORDER BY date DESC, id DESC'
  );
  return rows.map(mapExpense);
}

export async function getExpensesByDateRange(
  db: import('expo-sqlite').SQLiteDatabase,
  start: string,
  end: string
): Promise<Expense[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM expenses WHERE date >= ? AND date <= ? ORDER BY date DESC',
    [start, end]
  );
  return rows.map(mapExpense);
}

export async function insertExpense(
  db: import('expo-sqlite').SQLiteDatabase,
  expense: ExpenseInput
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO expenses (amount, category, date, merchant, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      expense.amount,
      expense.category,
      expense.date,
      expense.merchant,
      expense.note,
      new Date().toISOString(),
    ]
  );
  return result.lastInsertRowId;
}

export async function insertExpensesBatch(
  db: import('expo-sqlite').SQLiteDatabase,
  expenses: ExpenseInput[]
): Promise<void> {
  for (const expense of expenses) {
    await insertExpense(db, expense);
  }
}

export async function deleteExpense(
  db: import('expo-sqlite').SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

export async function updateExpense(
  db: import('expo-sqlite').SQLiteDatabase,
  id: number,
  updates: Partial<ExpenseInput>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
  if (updates.merchant !== undefined) { fields.push('merchant = ?'); values.push(updates.merchant); }
  if (updates.note !== undefined) { fields.push('note = ?'); values.push(updates.note); }
  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, values);
}

// --- Goals ---

export async function getAllGoals(db: import('expo-sqlite').SQLiteDatabase): Promise<Goal[]> {
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM goals ORDER BY month DESC, id DESC'
  );
  return rows.map(mapGoal);
}

export async function getActiveGoals(
  db: import('expo-sqlite').SQLiteDatabase,
  month?: string
): Promise<Goal[]> {
  if (month) {
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM goals WHERE status = 'active' AND month = ? ORDER BY id DESC`,
      [month]
    );
    return rows.map(mapGoal);
  }
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM goals WHERE status = 'active' ORDER BY month DESC, id DESC`
  );
  return rows.map(mapGoal);
}

export async function insertGoal(
  db: import('expo-sqlite').SQLiteDatabase,
  goal: GoalInput
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO goals (name, target_amount, current_amount, goal_type, category, month, status, recurrence, link_savings_transactions, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      goal.name,
      goal.targetAmount,
      goal.currentAmount,
      goal.goalType,
      goal.category,
      goal.month,
      goal.status,
      goal.recurrence,
      goal.linkSavingsTransactions ? 1 : 0,
      new Date().toISOString(),
    ]
  );
  return result.lastInsertRowId;
}

export async function updateGoal(
  db: import('expo-sqlite').SQLiteDatabase,
  id: number,
  updates: Partial<GoalInput>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  const map: [keyof GoalInput, string][] = [
    ['name', 'name'],
    ['targetAmount', 'target_amount'],
    ['currentAmount', 'current_amount'],
    ['goalType', 'goal_type'],
    ['category', 'category'],
    ['month', 'month'],
    ['status', 'status'],
    ['recurrence', 'recurrence'],
  ];
  for (const [key, col] of map) {
    if (updates[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(updates[key] as string | number | null);
    }
  }
  if (updates.linkSavingsTransactions !== undefined) {
    fields.push('link_savings_transactions = ?');
    values.push(updates.linkSavingsTransactions ? 1 : 0);
  }
  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function deleteGoal(
  db: import('expo-sqlite').SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
}
