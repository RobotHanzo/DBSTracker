import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '3000', 10);
const DBS_API_URL = process.env.DBS_API_URL || 'https://www.dbs.com.tw/tw-rates-api/v1/api/twrates/latestForexRates';
const FETCH_INTERVAL_MS = parseInt(process.env.FETCH_INTERVAL_MS || '300000', 10); // 5 minutes

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/DBSTracker';
let isDbConnected = false;

mongoose.connect(MONGODB_URI, { dbName: 'DBSTracker' }).then(() => {
  console.log('[DBSTracker] Connected to MongoDB');
  isDbConnected = true;
  // Start fetching immediately after connecting
  fetchAndStoreRates();
  setInterval(fetchAndStoreRates, FETCH_INTERVAL_MS);
}).catch(err => {
  console.error('[DBSTracker] MongoDB connection error:', err);
  console.log('[DBSTracker] Starting without DB - using purely for UI testing if connection fails.');
});

// Mongoose Schema
const rateSchema = new mongoose.Schema({
  currency: { type: String, required: true },
  timestamp: { type: Date, required: true },
  ttBuy: Number,
  ttSell: Number,
  cashBuy: Number,
  cashSell: Number
});

// Compound index to prevent duplicates
rateSchema.index({ currency: 1, timestamp: 1 }, { unique: true });

const Rate = mongoose.model('Rate', rateSchema);

async function fetchAndStoreRates() {
  if (!isDbConnected) return;

  try {
    const response = await axios.get(DBS_API_URL);
    const data = response.data;
    
    // Parse effective date
    const effectiveDateStr = data.effectiveDateAndTime;
    // The timestamp will be Unix time. Let's parse exactly treating it as +08:00
    const timeValue = new Date(effectiveDateStr.replace(' ', 'T') + '+08:00'); 
    
    const assets = data.results?.assets;
    if (!assets || assets.length === 0) return;
    const recData = assets[0].recData;

    for (const rate of recData) {
      if (['USD', 'SGD'].includes(rate.currency)) {
        await Rate.findOneAndUpdate(
          { currency: rate.currency, timestamp: timeValue },
          {
            currency: rate.currency,
            timestamp: timeValue,
            ttSell: rate.ttSell ? parseFloat(rate.ttSell) : null,
            ttBuy: rate.ttBuy ? parseFloat(rate.ttBuy) : null,
            cashSell: rate.cashSell ? parseFloat(rate.cashSell) : null,
            cashBuy: rate.cashBuy ? parseFloat(rate.cashBuy) : null,
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
      }
    }
    console.log(`[DBSTracker] Rates updated for effective date: ${effectiveDateStr}`);
  } catch (error) {
    console.error('[DBSTracker] Error fetching rates:', error instanceof Error ? error.message : String(error));
  }
}

// API Routes
app.get('/api/rates', async (req, res) => {
  if (!isDbConnected) return res.json([]);
  try {
    const { currency, limit } = req.query;
    
    const filter = currency ? { currency: currency as string } : {};
    const queryLimit = parseInt(limit as string) || 500;
    
    const rates = await Rate.find(filter)
      .sort({ timestamp: 1 })
      .limit(queryLimit);
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/latest', async (req, res) => {
  if (!isDbConnected) return res.json({ rates: [], timestamp: null });
  try {
    // Find highest timestamp
    const latestDoc = await Rate.findOne().sort({ timestamp: -1 });
    if (!latestDoc) {
       return res.json({ rates: [], timestamp: null });
    }
    const latestRates = await Rate.find({ timestamp: latestDoc.timestamp });

    // Find rates from 24 hours ago
    const oneDayAgo = new Date(latestDoc.timestamp.getTime() - 24 * 60 * 60 * 1000);
    const dayAgoDoc = await Rate.findOne({ timestamp: { $lte: oneDayAgo } }).sort({ timestamp: -1 });
    let previousRates: any[] = [];
    if (dayAgoDoc) {
      previousRates = await Rate.find({ timestamp: dayAgoDoc.timestamp });
    }

    const ratesWithChange = latestRates.map(lr => {
      const pr = previousRates.find(p => p.currency === lr.currency);
      return {
        ...lr.toObject(),
        previousTtSell: pr ? pr.ttSell : null,
      };
    });

    res.json({
      rates: ratesWithChange,
      timestamp: latestDoc.timestamp
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const isProd = process.env.NODE_ENV === 'production';

async function createServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log('[DBSTracker] Server listening on port', PORT);
  });
}

createServer();
