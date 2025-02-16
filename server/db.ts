import mysql from 'mysql2/promise';

if (!process.env.MYSQL_DATABASE_URL) {
  throw new Error("MYSQL_DATABASE_URL environment variable must be set");
}

export const pool = mysql.createPool(process.env.MYSQL_DATABASE_URL);

// Helper function to execute queries
export async function query(sql: string, params?: any[]) {
  const [results] = await pool.execute(sql, params);
  return results;
}