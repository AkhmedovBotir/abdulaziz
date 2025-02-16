import TelegramBot from "node-telegram-bot-api";
import nodemailer from "nodemailer";
import { storage } from "./storage";
import { Lead } from "@shared/schema";

if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
  throw new Error("Telegram configuration missing");
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("Email configuration missing");
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const chatId = process.env.TELEGRAM_CHAT_ID;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function formatLeadMessage(lead: Lead): string {
  return `
New Lead Received!
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'Not provided'}
Form: ${lead.formId}
Status: ${lead.status}
`;
}

export async function sendTelegramNotification(lead: Lead): Promise<void> {
  try {
    await bot.sendMessage(chatId, formatLeadMessage(lead));
  } catch (error) {
    console.error('Telegram notification failed:', error);
    throw error;
  }
}

export async function sendEmailNotification(lead: Lead): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Lead: ${lead.name}`,
      text: formatLeadMessage(lead),
    });
  } catch (error) {
    console.error('Email notification failed:', error);
    throw error;
  }
}

export async function processNotifications() {
  const pendingNotifications = await storage.getPendingNotifications();
  
  for (const notification of pendingNotifications) {
    try {
      const lead = (await storage.getLeads({ id: notification.leadId }))[0];
      if (!lead) continue;

      if (notification.type === 'telegram') {
        await sendTelegramNotification(lead);
      } else if (notification.type === 'email') {
        await sendEmailNotification(lead);
      }

      await storage.markNotificationSent(notification.id);
    } catch (error) {
      await storage.markNotificationSent(notification.id, (error as Error).message);
    }
  }
}

// Start notification processing
setInterval(processNotifications, 30000);
