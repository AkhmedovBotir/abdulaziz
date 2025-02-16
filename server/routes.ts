import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { processFacebookLead } from "./facebook";
import { z } from "zod";

// Facebook webhook verification payload schema
const webhookVerificationSchema = z.object({
  'hub.mode': z.literal('subscribe'),
  'hub.verify_token': z.string(),
  'hub.challenge': z.string()
});

// Facebook lead webhook payload schema
const leadSchema = z.object({
  object: z.literal('page'),
  entry: z.array(z.object({
    changes: z.array(z.object({
      value: z.object({
        form_id: z.string(),
        leadgen_id: z.string()
      })
    }))
  }))
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Facebook Webhook verification endpoint
  app.get("/api/webhook/facebook", (req, res) => {
    try {
      const result = webhookVerificationSchema.parse(req.query);

      if (!process.env.FACEBOOK_VERIFY_TOKEN) {
        throw new Error("FACEBOOK_VERIFY_TOKEN environment variable must be set");
      }

      if (result['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
        res.send(result['hub.challenge']);
      } else {
        res.sendStatus(403);
      }
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Facebook Lead webhook endpoint
  app.post("/api/webhook/facebook", async (req, res) => {
    try {
      const payload = leadSchema.parse(req.body);
      const leads = await Promise.all(
        payload.entry.flatMap(entry =>
          entry.changes.map(async change => {
            const lead = await processFacebookLead(change.value);
            return lead;
          })
        )
      );
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get leads with optional filters
  app.get("/api/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;
      const leads = await storage.getLeads(filters);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Update lead status
  app.patch("/api/leads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const lead = await storage.updateLead(Number(req.params.id), req.body);
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}