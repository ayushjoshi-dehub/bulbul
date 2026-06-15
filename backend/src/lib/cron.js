//this will send request every 14 minutes to the server to keep it alive on render.com
import { CronJob } from 'cron';
import http from 'node:http';
import https from 'node:https';

//every 14 min send a GET req to the health endpoint

const job = new CronJob('*/14 * * * *', function()  {
    const base=process.env.FRONTEND_URL
    if(!basse) return;
    const url = new URL('/health', base).href;
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
        if(res.statusCode === 200) console.log('Server is alive');
        else console.error('Health check failed with status code:', res.statusCode);
    }).on('error', (e) => console.error("Error during health check:", e));
    }); 

    export default job;