import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertUser, OAuthProvider, InsertOAuthProvider } from "@shared/schema";
import SpotifyWebApi from "spotify-web-api-node";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Session {
      linkUserId?: number;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string | null) {
  if (!stored) return false;
  
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Middleware to check if user is admin
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as SelectUser;
  if (!user.isAdmin) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  
  next();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "disc-music-discovery-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        if (!(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }),
  );
  
  // Spotify OAuth strategy
  const spotifyCallbackURL = process.env.NODE_ENV === "production" 
    ? "https://disc.replit.app/api/auth/spotify/callback"
    : "http://localhost:5000/api/auth/spotify/callback";
    
  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.SPOTIFY_CLIENT_ID!,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
        callbackURL: spotifyCallbackURL,
        scope: [
          "user-read-email", 
          "user-read-private", 
          "user-top-read",
          "user-read-recently-played",
          "user-library-read"
        ],
      },
      async (accessToken, refreshToken, expiresIn, profile, done) => {
        try {
          // Calculate token expiration date
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
          
          // Check if user already exists with this Spotify ID
          let user = await storage.getUserByOAuthProvider("spotify", profile.id);
          
          if (user) {
            // User exists, update their OAuth tokens
            const oauthProvider = await storage.getOAuthProviderByUserId(user.id, "spotify");
            
            if (oauthProvider) {
              await storage.updateOAuthProviderTokens(
                oauthProvider.id,
                accessToken,
                refreshToken,
                expiresAt
              );
            }
            
            return done(null, user);
          }
          
          // User doesn't exist, create a new one
          const username = profile.displayName || `spotify_${profile.id}`;
          let email: string | undefined = undefined;
          let photo: string | undefined = undefined;
          
          // Extract email and profile image if available
          if (profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value;
          }
          
          if (profile.photos && profile.photos.length > 0) {
            photo = profile.photos[0];
          }
          
          // Create unique username if it already exists
          let finalUsername = username;
          const existingUser = await storage.getUserByUsername(username);
          
          if (existingUser) {
            finalUsername = `${username}_${randomUUID().substring(0, 8)}`;
          }
          
          // Create the new user
          user = await storage.createUser({
            username: finalUsername,
            email,
            profileImage: photo,
          });
          
          // Store OAuth provider info
          await storage.createOAuthProvider({
            userId: user.id,
            provider: "spotify",
            providerId: profile.id,
            accessToken,
            refreshToken,
            tokenExpiresAt: expiresAt,
            profileData: profile,
          });
          
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", (req, res, next) => {
    // Check if rememberMe flag is set
    const rememberMe = req.body.rememberMe === true;
    
    // If rememberMe is true, set cookie to expire in 30 days
    // Otherwise, use the default session cookie (expires when browser is closed)
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    
    passport.authenticate(
      "local", 
      (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        req.login(user, (loginErr: Error | null) => {
          if (loginErr) {
            return next(loginErr);
          }
          return res.status(200).json(user);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error | null) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  // Spotify OAuth routes
  app.get("/api/auth/spotify", passport.authenticate("spotify"));
  
  app.get(
    "/api/auth/spotify/callback",
    passport.authenticate("spotify", {
      failureRedirect: "/auth?error=spotify-auth-failed",
    }),
    (req, res) => {
      // Successful authentication, redirect to home page
      res.redirect("/");
    }
  );
  
  // Get current user's Spotify profile
  app.get("/api/spotify/me", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as SelectUser;
      const oauthProvider = await storage.getOAuthProviderByUserId(user.id, "spotify");
      
      if (!oauthProvider) {
        return res.status(404).json({ message: "No Spotify account connected" });
      }
      
      const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID || "",
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      });
      
      // Set the access token
      spotifyApi.setAccessToken(oauthProvider.accessToken || "");
      
      // Get user's Spotify profile
      const response = await spotifyApi.getMe();
      res.json(response.body);
    } catch (error) {
      console.error("Error getting Spotify profile:", error);
      res.status(500).json({ message: "Failed to get Spotify profile" });
    }
  });
  
  // Link Spotify account to existing user
  app.get("/api/link/spotify", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to link accounts" });
    }
    
    // Store the user's ID in the session to retrieve later
    (req.session as any).linkUserId = (req.user as SelectUser).id;
    
    passport.authenticate("spotify", {
      scope: [
        "user-read-email", 
        "user-read-private", 
        "user-top-read",
        "user-read-recently-played",
        "user-library-read"
      ]
    })(req, res, next);
  });
  
  // Callback for linking Spotify account
  app.get(
    "/api/link/spotify/callback",
    passport.authenticate("spotify", { failureRedirect: "/account?error=spotify-link-failed" }),
    async (req, res) => {
      try {
        // Get the linkUserId from the session
        const linkUserId = (req.session as any).linkUserId;
        
        if (!linkUserId) {
          return res.redirect("/account?error=spotify-link-failed-no-user");
        }
        
        // Get the current user from the authentication
        if (!req.user || !req.isAuthenticated()) {
          return res.redirect("/account?error=spotify-link-failed-not-authenticated");
        }
        
        const user = req.user as SelectUser;
        const spotifyUser = await storage.getUserByOAuthProvider("spotify", user.id.toString());
        
        if (spotifyUser && spotifyUser.id !== linkUserId) {
          // This Spotify account is already linked to a different user
          return res.redirect("/account?error=spotify-already-linked");
        }
        
        // Link successful, clear linkUserId from session
        delete (req.session as any).linkUserId;
        
        // Redirect to account page with success message
        res.redirect("/account?success=spotify-linked");
      } catch (error) {
        console.error("Error linking Spotify account:", error);
        res.redirect("/account?error=spotify-link-failed-server-error");
      }
    }
  );
  
  // Get user's top Spotify tracks
  app.get("/api/spotify/top-tracks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = req.user as SelectUser;
      const oauthProvider = await storage.getOAuthProviderByUserId(user.id, "spotify");
      
      if (!oauthProvider) {
        return res.status(404).json({ message: "No Spotify account connected" });
      }
      
      const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID || "",
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      });
      
      // Set the access token
      spotifyApi.setAccessToken(oauthProvider.accessToken || "");
      
      // Check if token has expired
      const now = new Date();
      if (oauthProvider.tokenExpiresAt && oauthProvider.tokenExpiresAt < now) {
        // Token has expired, try to refresh it
        if (!oauthProvider.refreshToken) {
          return res.status(401).json({ message: "Spotify access expired, please reconnect your account" });
        }
        
        spotifyApi.setRefreshToken(oauthProvider.refreshToken || "");
        const refreshData = await spotifyApi.refreshAccessToken();
        
        // Update tokens in database
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + refreshData.body.expires_in);
        
        await storage.updateOAuthProviderTokens(
          oauthProvider.id,
          refreshData.body.access_token,
          oauthProvider.refreshToken,
          expiresAt
        );
        
        // Update access token for current request
        spotifyApi.setAccessToken(refreshData.body.access_token);
      }
      
      // Get user's top tracks
      const response = await spotifyApi.getMyTopTracks({ limit: 20, time_range: 'medium_term' });
      res.json(response.body);
    } catch (error) {
      console.error("Error getting Spotify top tracks:", error);
      res.status(500).json({ message: "Failed to get Spotify top tracks" });
    }
  });
}
