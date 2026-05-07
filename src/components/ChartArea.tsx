import { RefreshCw, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CandleChart } from '../Chart';
import { FLAGS, INTERVALS } from '../types';
import type { Pair, Interval } from '../types';

type SlideDir = 'left' | 'right' | 'up' | 'down';

interface ChartAreaProps {
  activePair: Pair;
  interval: Interval;
  customVal: number;
  customUnit: 'm' | 'h' | 'd';
  loading: boolean;
  isDark: boolean;
  slideDir: SlideDir;
  chartData: { time: number; open: number; high: number; low: number; close: number }[];
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

export function ChartArea({
  activePair,
  interval,
  customVal,
  customUnit,
  loading,
  isDark,
  slideDir,
  chartData,
  onOpenSidebar,
  onSetInterval,
}: ChartAreaProps) {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#0f172a] min-h-0 overflow-hidden w-full">
      {/* Title + Interval Selector */}
      <div className="flex flex-row justify-between items-start sm:items-end mb-4 sm:mb-8 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-medium mb-1 tracking-wide flex items-center gap-2">
            <button
              onClick={onOpenSidebar}
              className="md:hidden p-1 -ml-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            DBS ForEx
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {FLAGS[activePair]} {activePair} to {FLAGS.TWD} TWD
            <span className="text-slate-500 font-light ml-2 text-lg sm:text-2xl hidden sm:inline">Exchange Rate</span>
          </h2>
        </div>

        {/* Desktop interval pills */}
        <div className="hidden sm:flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1 border border-slate-300 dark:border-slate-800 shadow-inner text-xs font-bold w-auto">
          {INTERVALS.map(inv => (
            <button
              key={inv}
              onClick={() => onSetInterval(inv)}
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
              key={`${activePair}-${interval}-${customVal}-${customUnit}`}
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

      {/* Mobile interval pills */}
      <div className="flex sm:hidden mt-4 bg-slate-200 dark:bg-slate-900 rounded-lg p-1 border border-slate-300 dark:border-slate-800 shadow-inner text-xs font-bold w-full overflow-x-auto">
        {INTERVALS.map(inv => (
          <button
            key={inv}
            onClick={() => onSetInterval(inv)}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              interval === inv
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {inv}
          </button>
        ))}
      </div>
    </main>
  );
}
