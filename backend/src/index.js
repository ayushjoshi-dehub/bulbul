import express from 'express';
import 'dotenv/config';
import User from './models/user.model.js';
import { connectDB } from './lib/db.js';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import fs from "fs";
import path from "path";
import clerkWebhook from './webhooks/clerk.webhook.js';

const app = express();
const PORT = process.env.PORT || 3001; // Semicolon explicitly added with fallback port
const FRONTEND_URL = process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");

//it is important to place the webhook route before the JSON body parser, 
// as Clerk's webhook signature verification requires the raw request body.
//  If we were to place the JSON parser first, it would consume the request body and prevent Clerk from verifying the signature correctly, leading to failed webhook requests.
//  By defining the webhook route with express.raw() before any middleware that parses the body, we ensure that Clerk can access the raw payload 
// for signature verification, allowing our webhooks to function securely and reliably.
app.use("/api/webhooks/clerk",express.raw({ type: "application/json" }),clerkWebhook); // Clerk webhook needs raw body for signature verification
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

// If the public directory exists, serve static files from it.
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    
    // This catch-all handles your SPA routing cleanly now!
   app.get('/{*splat}', (req, res, next) => {
    res.sendFile(path.join(publicDir, 'index.html'), (err) => {
        if (err) {
            next(err);
        }
    });
});
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);

if(process.env.NODE_ENV === 'production') job.start(); // Start the cron job to keep the server alive
});