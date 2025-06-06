import session from "express-session";
import type { Express, RequestHandler, Request } from "express";
import { storage } from "./storage";
import MemoryStore from "memorystore";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  const MemoryStoreSession = MemoryStore(session);
  const isProduction = process.env.NODE_ENV === "production";
  
  app.use(session({
    secret: process.env.SESSION_SECRET || "restaurant-pos-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? 'none' : 'lax',
    },
  }));

  // Simple login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // For demo purposes, accept any email/password
      // In production, implement proper authentication
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Create or get user
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          id: `user_${Date.now()}`,
          email,
          firstName: email.split('@')[0],
          lastName: "User",
          role: "admin",
          isActive: true,
        });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      res.json({ user, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Auto-login endpoint for demo
  app.post("/api/auto-login", async (req, res) => {
    try {
      // Auto-login with demo user
      let user = await storage.getUserByEmail("demo@restaurant.com");
      if (!user) {
        user = await storage.createUser({
          id: `demo_${Date.now()}`,
          email: "demo@restaurant.com",
          firstName: "Demo",
          lastName: "User",
          role: "admin",
          isActive: true,
        });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = user;

      res.json({ user, message: "Auto-login successful" });
    } catch (error) {
      console.error("Auto-login error:", error);
      res.status(500).json({ message: "Auto-login failed" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req: any, res) => {
    const session = req.session as any;
    
    if (!session || !session.userId || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(session.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const session = req.session as any;
  
  if (!session || !session.userId || !session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify user still exists
  try {
    const user = await storage.getUser(session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};