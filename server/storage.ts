import { User, Lead, Notification } from "@shared/schema";
import { pool, query } from "./db";
import session from "express-session";
import MySQLStore from "express-mysql-session";

const SessionStore = MySQLStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id" | "isAdmin">): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  createLead(lead: Omit<Lead, "id">): Promise<Lead>;
  getLeads(filters?: Partial<Lead>): Promise<Lead[]>;
  updateLead(id: number, data: Partial<Lead>): Promise<Lead>;

  createNotification(notification: Omit<Notification, "id">): Promise<Notification>;
  getPendingNotifications(): Promise<Notification[]>;
  markNotificationSent(id: number, error?: string): Promise<void>;

  sessionStore: session.Store;
}

export class MySQLStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new SessionStore({
      createDatabaseTable: true,
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      }
    }, pool);
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    return users[0];
  }

  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    const users = await query('SELECT * FROM users WHERE facebook_id = ?', [facebookId]);
    return users[0];
  }

  async createUser(user: Omit<User, "id" | "isAdmin">): Promise<User> {
    const result = await query(
      'INSERT INTO users (username, password, facebook_id, facebook_access_token, facebook_pages) VALUES (?, ?, ?, ?, ?)',
      [user.username, user.password, user.facebookId, user.facebookAccessToken, JSON.stringify(user.facebookPages)]
    );
    return this.getUser(result.insertId);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const sets = [];
    const params = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'facebookPages') {
        sets.push(`facebook_pages = ?`);
        params.push(JSON.stringify(value));
      } else if (key === 'facebookId') {
        sets.push(`facebook_id = ?`);
        params.push(value);
      } else if (key === 'facebookAccessToken') {
        sets.push(`facebook_access_token = ?`);
        params.push(value);
      } else {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    });

    params.push(id);

    await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedUser] = await query('SELECT * FROM users WHERE id = ?', [id]);
    return updatedUser;
  }

  async createLead(lead: Omit<Lead, "id">): Promise<Lead> {
    const result = await query(
      'INSERT INTO leads (lead_id, form_id, page_id, name, email, phone, data) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [lead.leadId, lead.formId, lead.pageId, lead.name, lead.email, lead.phone, JSON.stringify(lead.data)]
    );
    const [newLead] = await query('SELECT * FROM leads WHERE id = ?', [result.insertId]);
    return newLead;
  }

  async getLeads(filters?: Partial<Lead>): Promise<Lead[]> {
    let sql = 'SELECT * FROM leads';
    const params = [];

    if (filters) {
      const conditions = [];
      Object.entries(filters).forEach(([key, value]) => {
        conditions.push(`${key} = ?`);
        params.push(value);
      });
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    return query(sql, params);
  }

  async updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
    const sets = [];
    const params = [];

    Object.entries(data).forEach(([key, value]) => {
      sets.push(`${key} = ?`);
      params.push(value);
    });

    params.push(id);

    await query(
      `UPDATE leads SET ${sets.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedLead] = await query('SELECT * FROM leads WHERE id = ?', [id]);
    return updatedLead;
  }

  async createNotification(notification: Omit<Notification, "id">): Promise<Notification> {
    const result = await query(
      'INSERT INTO notifications (lead_id, type) VALUES (?, ?)',
      [notification.leadId, notification.type]
    );
    const [newNotification] = await query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    return newNotification;
  }

  async getPendingNotifications(): Promise<Notification[]> {
    return query('SELECT * FROM notifications WHERE sent = FALSE');
  }

  async markNotificationSent(id: number, error?: string): Promise<void> {
    await query(
      'UPDATE notifications SET sent = TRUE, error = ? WHERE id = ?',
      [error || null, id]
    );
  }
}

export const storage = new MySQLStorage();