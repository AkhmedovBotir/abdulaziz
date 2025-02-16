import { Lead } from "@shared/schema";
import { storage } from "./storage";

export interface FacebookLead {
  id: string;
  form_id: string;
  created_time: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
}

async function getFacebookLeadData(leadgen_id: string): Promise<FacebookLead> {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    throw new Error("Facebook credentials are missing");
  }

  // Get access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&grant_type=client_credentials`
  );

  if (!tokenRes.ok) {
    throw new Error("Failed to get Facebook access token");
  }

  const { access_token } = await tokenRes.json();

  // Get lead data
  const leadRes = await fetch(
    `https://graph.facebook.com/v19.0/${leadgen_id}?access_token=${access_token}`
  );

  if (!leadRes.ok) {
    throw new Error("Failed to get lead data from Facebook");
  }

  return leadRes.json();
}

export async function processFacebookLead(webhookData: { form_id: string; leadgen_id: string }): Promise<Lead> {
  const leadData = await getFacebookLeadData(webhookData.leadgen_id);

  // Extract fields from lead data
  const getFieldValue = (name: string) => {
    const field = leadData.field_data.find(f => f.name === name);
    return field?.values[0] || '';
  };

  const lead = await storage.createLead({
    leadId: leadData.id,
    formId: leadData.form_id,
    name: getFieldValue('full_name'),
    email: getFieldValue('email'),
    phone: getFieldValue('phone_number'),
    createdAt: new Date(leadData.created_time),
    status: 'new',
    data: leadData,
    processed: false
  });

  // Create notifications
  await Promise.all([
    storage.createNotification({
      leadId: lead.id,
      type: 'telegram',
      sent: false,
      error: null,
      createdAt: new Date()
    }),
    storage.createNotification({
      leadId: lead.id,
      type: 'email',
      sent: false,
      error: null,
      createdAt: new Date()
    })
  ]);

  return lead;
}