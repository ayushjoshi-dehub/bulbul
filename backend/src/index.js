 import express from 'express'
 import  'dotenv/config';
import User from './models/user.model.js';
import { connectDB } from './lib/db.js';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import fs from "fs";
import path from "path";


 const app = express()
 const PORT= process.env.PORT
 const FRONTEND_URL = process.env.FRONTEND_URL ;
const publicDir=path.join(process.cwd(),"public");

app.use(express.json());
//CORS  is a browser security rule that restricts web applications from making requests to a different domain than the one that served the web page. In this case, it allows our frontend (which might be running on a different port or domain) to communicate with our backend API without being blocked by the browser's same-origin policy.
app.use(cors({origin :FRONTEND_URL,credentials:true})); // Enable CORS for the frontend URL with credentials support

// Middleware to attach user info to request based on Clerk authentication
app.use(clerkMiddleware());

app.get('/', (req, res) => {
    res.send('Hello World!')
});
//if the public directory exists, serve static files from it.
//  This is useful for serving frontend assets like HTML, CSS, and JavaScript files directly from the backend server.
//for production only, in development the frontend will be served by Vite's development server, 
// so we don't need to serve static files from the backend.
if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));
    app.get('*catchall', (req, res, next) => {
    res.sendFile(path.join(publicDir, 'index.html'), (err) => {
        if (err) {
            next(err); // Now next is safely defined!
        }
    });
});
}

 app.listen(PORT, () => {
    connectDB();
        console.log(`Server is running on port ${PORT}`);
    });