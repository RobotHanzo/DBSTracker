import { FLAGS } from '../types';
import type { Pair, RateDoc } from '../types';

interface FooterProps {
  activePair: Pair;
  latestRates: Record<string, RateDoc>;
  onShowDisclaimer: () => void;
}

export function Footer({ activePair, latestRates, onShowDisclaimer }: FooterProps) {
  return (
    <footer className="h-12 border-t border-slate-200 dark:border-slate-800 px-6 lg:px-8 flex items-center justify-between bg-white dark:bg-[#0f172a] text-[10px] uppercase tracking-widest text-slate-500 font-bold shrink-0 relative z-20">
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/robothanzo/DBSTracker"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </a>
        <div className="hidden sm:block truncate pr-4">
          This website is in no way affiliated with DBS, the information is provided as-is without any liabilities attributable to the author.
        </div>
      </div>

      <button
        className="sm:hidden px-2 py-1.5 bg-slate-200 dark:bg-slate-800 rounded font-bold text-slate-600 dark:text-slate-400"
        onClick={onShowDisclaimer}
      >
        Disclaimer
      </button>

      <div className="flex gap-4 sm:gap-8 overflow-x-auto hide-scrollbar whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="hidden sm:inline">{FLAGS[activePair]} {activePair} </span>BUY: {latestRates[activePair]?.ttBuy?.toFixed(3) || '...'}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span className="hidden sm:inline">{FLAGS[activePair]} {activePair} </span>SELL: {latestRates[activePair]?.ttSell?.toFixed(3) || '...'}
        </div>
      </div>
    </footer>
  );
}
