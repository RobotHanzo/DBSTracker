import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChartArea } from './components/ChartArea';
import { Footer } from './components/Footer';
import { DisclaimerModal, CustomIntervalModal } from './components/Modals';

import type { Pair, Interval, RateDoc } from './types';
import { INTERVALS, PAIRS } from './types';

export default function App() {
  // ── Persisted preferences ──────────────────────────────────────────────────
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('theme') as 'light' | 'dark') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  const [activePair, setActivePair] = useState<Pair>(
    () => (localStorage.getItem('activePair') as Pair) || 'SGD'
  );
  const [interval, setInterval] = useState<Interval>(
    () => (localStorage.getItem('interval') as Interval) || '1h'
  );

  // ── UI state ───────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showCustomInterval, setShowCustomInterval] = useState(false);
  const [customVal, setCustomVal] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<'m' | 'h' | 'd'>('h');
  const [slideDir, setSlideDir] = useState<'left' | 'right' | 'up' | 'down'>('left');

  // ── Data state ─────────────────────────────────────────────────────────────
  const [rates, setRates] = useState<RateDoc[]>([]);
  const [latestRates, setLatestRates] = useState<Record<string, RateDoc>>({});
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // ── Theme sync ─────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, latestRes] = await Promise.all([
        axios.get(`/api/rates?currency=${activePair}`),
        axios.get('/api/latest'),
      ]);
      setRates(historyRes.data);
      const latestMap: Record<string, RateDoc> = {};
      latestRes.data.rates.forEach((r: RateDoc) => { latestMap[r.currency] = r; });
      setLatestRates(latestMap);
      if (latestRes.data.timestamp) {
        setEffectiveDate(new Date(latestRes.data.timestamp).toLocaleString());
      }
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = window.setInterval(fetchData, 60 * 1000);
    return () => clearInterval(timer);
  }, [activePair]);

  // ── OHLC bucketing ─────────────────────────────────────────────────────────
  const chartData = React.useMemo(() => {
    if (!rates.length) return [];
    let bucketMs = 30 * 60 * 1000;
    if (interval === '1h')  bucketMs = 60 * 60 * 1000;
    if (interval === '12h') bucketMs = 12 * 60 * 60 * 1000;
    if (interval === '1d')  bucketMs = 24 * 60 * 60 * 1000;
    if (interval === '1w')  bucketMs = 7 * 24 * 60 * 60 * 1000;
    if (interval === 'custom') {
      const mult = customUnit === 'd' ? 86400000 : customUnit === 'h' ? 3600000 : 60000;
      bucketMs = Math.max(customVal * mult, 60000);
    }
    const map = new Map<number, { time: number; open: number; high: number; low: number; close: number }>();
    rates.forEach((r, i) => {
      if (!r.ttSell) return;
      const t = new Date(r.timestamp).getTime();
      const key = Math.floor(t / bucketMs) * bucketMs;
      if (!map.has(key)) {
        const prevClose = i > 0 && rates[i - 1].ttSell ? rates[i - 1].ttSell : r.ttSell;
        map.set(key, { time: key, open: prevClose, high: r.ttSell, low: r.ttSell, close: r.ttSell });
      } else {
        const b = map.get(key)!;
        b.high = Math.max(b.high, r.ttSell);
        b.low = Math.min(b.low, r.ttSell);
        b.close = r.ttSell;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.time - b.time);
  }, [rates, interval, customVal, customUnit]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSetInterval = (inv: Interval) => {
    const oldIdx = INTERVALS.indexOf(interval);
    const newIdx = INTERVALS.indexOf(inv);
    setSlideDir(newIdx > oldIdx ? 'left' : 'right');
    if (inv === 'custom') setShowCustomInterval(true);
    setInterval(inv);
    localStorage.setItem('interval', inv);
  };

  const handleSetPair = (pair: Pair) => {
    setSlideDir(PAIRS.indexOf(pair) > PAIRS.indexOf(activePair) ? 'down' : 'up');
    setActivePair(pair);
    localStorage.setItem('activePair', pair);
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 relative">
      <Header
        theme={theme}
        effectiveDate={effectiveDate}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <Sidebar
          isOpen={sidebarOpen}
          activePair={activePair}
          latestRates={latestRates}
          onSelectPair={handleSetPair}
          onClose={() => setSidebarOpen(false)}
        />
        <ChartArea
          activePair={activePair}
          interval={interval}
          customVal={customVal}
          customUnit={customUnit}
          loading={loading}
          isDark={theme === 'dark'}
          slideDir={slideDir}
          chartData={chartData}
          onOpenSidebar={() => setSidebarOpen(true)}
          onSetInterval={handleSetInterval}
        />
      </div>

      <Footer
        activePair={activePair}
        latestRates={latestRates}
        onShowDisclaimer={() => setShowDisclaimer(true)}
      />

      {showDisclaimer && <DisclaimerModal onClose={() => setShowDisclaimer(false)} />}
      {showCustomInterval && (
        <CustomIntervalModal
          customVal={customVal}
          customUnit={customUnit}
          onChangeVal={setCustomVal}
          onChangeUnit={setCustomUnit}
          onClose={() => setShowCustomInterval(false)}
        />
      )}
    </div>
  );
}
