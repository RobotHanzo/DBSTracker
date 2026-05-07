import React, { useState, useEffect } from 'react';
import { Activity, Moon, Sun, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { CandleChart } from './Chart';

type Pair = 'USD' | 'SGD';
type Interval = '5m' | '15m' | '1h';

interface RateDoc {
  currency: string;
  effectiveDate: string;
  lastUpdated: string;
  timestamp: string;
  ttSell: number;
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') as 'light' | 'dark' || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  const [activePair, setActivePair] = useState<Pair>('USD');
  const [interval, setInterval] = useState<Interval>('5m');
  const [rates, setRates] = useState<RateDoc[]>([]);
  const [latestRates, setLatestRates] = useState<Record<string, RateDoc>>({});
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Sync theme to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, latestRes] = await Promise.all([
        axios.get(`/api/rates?currency=${activePair}`),
        axios.get('/api/latest')
      ]);
      setRates(historyRes.data);
      
      const latestMap: Record<string, RateDoc> = {};
      latestRes.data.rates.forEach((r: RateDoc) => {
        latestMap[r.currency] = r;
      });
      setLatestRates(latestMap);
      if (latestRes.data.effectiveDate) {
        setEffectiveDate(latestRes.data.effectiveDate);
      }
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = window.setInterval(fetchData, 60 * 1000); // 1 minute poll for frontend
    return () => clearInterval(timer);
  }, [activePair]);

  // Process data into OHLC based on interval
  const chartData = React.useMemo(() => {
    if (!rates.length) return [];
    
    let bucketMs = 5 * 60 * 1000;
    if (interval === '15m') bucketMs = 15 * 60 * 1000;
    if (interval === '1h') bucketMs = 60 * 60 * 1000;

    const map = new Map<number, { time: number; open: number; high: number; low: number; close: number }>();

    rates.forEach((r, i) => {
      if (!r.ttSell) return;
      const t = new Date(r.timestamp).getTime();
      const bucketIdx = Math.floor(t / bucketMs) * bucketMs;

      // Make open the previous close if possible to simulate continuous candles
      let val = r.ttSell;

      if (!map.has(bucketIdx)) {
         // Try to find previous bucket's close for open, otherwise use val
         const prevClose = i > 0 && rates[i-1].ttSell ? rates[i-1].ttSell : val;
         map.set(bucketIdx, { time: bucketIdx, open: prevClose, high: val, low: val, close: val });
      } else {
         const bucket = map.get(bucketIdx)!;
         bucket.high = Math.max(bucket.high, val);
         bucket.low = Math.min(bucket.low, val);
         bucket.close = val;
      }
    });

    return Array.from(map.values()).sort((a,b) => a.time - b.time);
  }, [rates, interval]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Helper for UI pair
  const renderPairCard = (pair: Pair) => {
    const isActive = activePair === pair;
    const latest = latestRates[pair];
    const price = latest?.ttSell ? latest.ttSell.toFixed(3) : '...';
    
    // Quick pseudo percent change using chart data simulation or actual previous data if we wanted to
    return (
      <div 
        onClick={() => setActivePair(pair)}
        className={`p-4 rounded-xl border transition-all cursor-pointer ${
          isActive 
            ? 'bg-white dark:bg-[#1e293b] border-indigo-500 ring-1 ring-indigo-500/20 shadow-lg' 
            : 'bg-slate-50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
            {pair} / TWD
          </span>
          {/* Mock percent for UI demo purposes since we don't calculate full 24h change yet */}
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
            Live
          </span>
        </div>
        <div className={`text-2xl font-mono font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
          {price}
        </div>
        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">TT Sell Price</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Header */}
      <header className="h-16 px-6 lg:px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-1.5 rounded-lg shadow-sm">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DBSTracker</h1>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE FEED
          </div>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="text-right hidden md:block">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Effective Date</div>
            <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
              {effectiveDate || 'WAITING...'}
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-full md:w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 flex flex-col gap-6 shrink-0 z-10 shadow-sm md:shadow-none overflow-y-auto">
          <section>
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 block">Tracked Pairs</label>
            <div className="space-y-3 flex flex-col sm:flex-row md:flex-col gap-3 sm:gap-4 md:gap-0">
              {renderPairCard('USD')}
              {renderPairCard('SGD')}
            </div>
          </section>
        </aside>

        {/* Main Chart Area */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#0f172a] min-h-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-medium mb-1 tracking-wide">Market Analysis</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {activePair} to TWD 
                <span className="text-slate-500 font-light ml-2 text-lg sm:text-2xl">Candlestick</span>
              </h2>
            </div>
            <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1 border border-slate-300 dark:border-slate-800 shadow-inner text-xs font-bold w-full sm:w-auto overflow-x-auto">
              {(['5m', '15m', '1h'] as Interval[]).map(inv => (
                <button 
                  key={inv}
                  onClick={() => setInterval(inv)}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors ${
                    interval === inv 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {inv}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="flex-1 relative bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl overflow-hidden min-h-[300px]">
            {loading && chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span className="font-mono text-sm tracking-widest">LOADING</span>
              </div>
            ) : chartData.length > 0 ? (
               <CandleChart data={chartData} isDark={theme === 'dark'} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                 <span className="font-mono text-sm tracking-widest">NO DATA FOR {activePair}</span>
              </div>
            )}
          </div>
        </main>

      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-slate-200 dark:border-slate-800 px-6 lg:px-8 flex items-center justify-between bg-white dark:bg-[#0f172a] text-[10px] uppercase tracking-widest text-slate-500 font-bold shrink-0">
        <div>DBS BANK TAIWAN · FOREX TRACKER</div>
        <div className="flex gap-4 sm:gap-8 overflow-x-auto hide-scrollbar whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
            {activePair} BUY: {latestRates[activePair]?.ttBuy?.toFixed(3) || '...'}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 
            {activePair} SELL: {latestRates[activePair]?.ttSell?.toFixed(3) || '...'}
          </div>
        </div>
      </footer>
    </div>
  );
}
