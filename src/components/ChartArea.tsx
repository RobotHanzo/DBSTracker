import React from 'react';
import { RefreshCw, Menu, CalendarClock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CandleChart } from '../Chart';
import { FLAGS, INTERVALS } from '../types';
import type { Pair, Interval } from '../types';

type SlideDir = 'left' | 'right' | 'up' | 'down';

export interface RangePreset {
  label: string;
  hours: number;
}

export const RANGE_PRESETS: RangePreset[] = [
  { label: 'Last 1 hour',   hours: 1 },
  { label: 'Last 6 hours',  hours: 6 },
  { label: 'Last 12 hours', hours: 12 },
  { label: 'Last 24 hours', hours: 24 },
  { label: 'Last 3 days',   hours: 72 },
  { label: 'Last 7 days',   hours: 168 },
  { label: 'Last 30 days',  hours: 720 },
  { label: 'Last 90 days',  hours: 2160 },
];

interface ChartAreaProps {
  activePair: Pair;
  interval: Interval;
  customVal: number;
  customUnit: 'm' | 'h' | 'd';
  loading: boolean;
  isDark: boolean;
  slideDir: SlideDir;
  chartData: { time: number; open: number; high: number; low: number; close: number }[];
  fromDate: string;
  toDate: string;
  presetHours: number;    // 0 = custom
  onFromDateChange: (v: string) => void;
  onToDateChange: (v: string) => void;
  onApplyPreset: (hours: number) => void;
  onClearRange: () => void;
  onOpenSidebar: () => void;
  onSetInterval: (inv: Interval) => void;
}

const chartVariants = {
  enter: (dir: SlideDir) => ({
    opacity: 0,
    x: dir === 'left' ? '100%' : dir === 'right' ? '-100%' : 0,
    y: dir === 'down' ? '100%' : dir === 'up' ? '-100%' : 0,
  }),
  center: { opacity: 1, x: 0, y: 0 },
  exit: (dir: SlideDir) => ({
    opacity: 0,
    x: dir === 'left' ? '-100%' : dir === 'right' ? '100%' : 0,
    y: dir === 'down' ? '-100%' : dir === 'up' ? '100%' : 0,
  }),
};

const inputCls =
  'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors';

const selectCls =
  'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer';

/** Shared date range controls — rendered in both desktop and mobile layouts */
function DateRangePicker({
  fromDate, toDate, presetHours,
  onFromDateChange, onToDateChange, onApplyPreset, onClearRange,
  mobile = false,
}: {
  fromDate: string; toDate: string; presetHours: number;
  onFromDateChange: (v: string) => void;
  onToDateChange: (v: string) => void;
  onApplyPreset: (hours: number) => void;
  onClearRange: () => void;
  mobile?: boolean;
}) {
  const isCustom = presetHours === 0;

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    if (val > 0) onApplyPreset(val);
  };

  if (mobile) {
    return (
      <div className="flex flex-col gap-2">
        {/* Preset dropdown */}
        <div className="flex items-center gap-2">
          <CalendarClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={isCustom ? 0 : presetHours}
            onChange={handlePresetChange}
            className={`${selectCls} flex-1`}
          >
            {isCustom && <option value={0}>Custom range</option>}
            {RANGE_PRESETS.map(p => (
              <option key={p.hours} value={p.hours}>{p.label}</option>
            ))}
          </select>
        </div>
        {/* From */}
        <div className="flex items-center gap-2">
          <span className="w-3.5 shrink-0" />
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold w-8 shrink-0">From</span>
          <input type="datetime-local" value={fromDate} max={toDate || undefined}
            onChange={e => onFromDateChange(e.target.value)} className={`${inputCls} flex-1`} />
        </div>
        {/* To */}
        <div className="flex items-center gap-2">
          <span className="w-3.5 shrink-0" />
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold w-8 shrink-0">To</span>
          <input type="datetime-local" value={toDate} min={fromDate || undefined}
            onChange={e => onToDateChange(e.target.value)} className={`${inputCls} flex-1`} />
        </div>
        {isCustom && (
          <button onClick={onClearRange}
            className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors">
            <X className="w-3 h-3" /> Reset to Default
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CalendarClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      {/* Preset dropdown */}
      <select
        value={isCustom ? 0 : presetHours}
        onChange={handlePresetChange}
        className={selectCls}
      >
        {isCustom && <option value={0}>Custom range</option>}
        {RANGE_PRESETS.map(p => (
          <option key={p.hours} value={p.hours}>{p.label}</option>
        ))}
      </select>
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold shrink-0">From</span>
      <input type="datetime-local" value={fromDate} max={toDate || undefined}
        onChange={e => onFromDateChange(e.target.value)} className={inputCls} />
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold shrink-0">To</span>
      <input type="datetime-local" value={toDate} min={fromDate || undefined}
        onChange={e => onToDateChange(e.target.value)} className={inputCls} />
      {isCustom && (
        <button onClick={onClearRange}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors">
          <X className="w-3 h-3" /> Reset
        </button>
      )}
    </div>
  );
}

export function ChartArea({
  activePair, interval, customVal, customUnit,
  loading, isDark, slideDir, chartData,
  fromDate, toDate, presetHours,
  onFromDateChange, onToDateChange, onApplyPreset, onClearRange,
  onOpenSidebar, onSetInterval,
}: ChartAreaProps) {
  const dateRangeProps = { fromDate, toDate, presetHours, onFromDateChange, onToDateChange, onApplyPreset, onClearRange };

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#0f172a] min-h-0 overflow-hidden w-full">
      {/* Title row */}
      <div className="flex flex-row justify-between items-start sm:items-end mb-3 sm:mb-4 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-medium mb-1 tracking-wide flex items-center gap-2">
            <button onClick={onOpenSidebar}
              className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            DBS ForEx
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {FLAGS[activePair]} {activePair} to {FLAGS.TWD} TWD
            <span className="text-slate-500 font-light ml-2 text-lg sm:text-2xl hidden sm:inline">Exchange Rate</span>
          </h2>
        </div>

        {/* Desktop: right column — interval pills + date range */}
        <div className="hidden sm:flex flex-col items-end gap-2">
          <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1 border border-slate-300 dark:border-slate-800 shadow-inner text-xs font-bold">
            {INTERVALS.map(inv => (
              <button key={inv} onClick={() => onSetInterval(inv)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md transition-colors ${
                  interval === inv
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}>
                {inv}
              </button>
            ))}
          </div>
          <DateRangePicker {...dateRangeProps} />
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl overflow-hidden min-h-[300px]">
        {loading && chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span className="font-mono text-sm tracking-widest">LOADING</span>
          </div>
        ) : (
          <AnimatePresence custom={slideDir}>
            <motion.div
              key={`${activePair}-${interval}-${customVal}-${customUnit}-${fromDate}-${toDate}`}
              custom={slideDir}
              variants={chartVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {chartData.length > 0 ? (
                <CandleChart data={chartData} isDark={isDark} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <span className="font-mono text-sm tracking-widest">NO DATA FOR {FLAGS[activePair]} {activePair}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Mobile: interval pills */}
      <div className="flex sm:hidden mt-4 bg-slate-200 dark:bg-slate-900 rounded-lg p-1 border border-slate-300 dark:border-slate-800 shadow-inner text-xs font-bold w-full overflow-x-auto">
        {INTERVALS.map(inv => (
          <button key={inv} onClick={() => onSetInterval(inv)}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              interval === inv
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {inv}
          </button>
        ))}
      </div>

      {/* Mobile: date range pickers */}
      <div className="flex sm:hidden mt-3">
        <div className="w-full">
          <DateRangePicker {...dateRangeProps} mobile />
        </div>
      </div>
    </main>
  );
}
