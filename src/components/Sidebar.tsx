import React from 'react';
import { X } from 'lucide-react';
import { FLAGS, PAIRS } from '../types';
import type { Pair, RateDoc } from '../types';

interface PairCardProps {
  pair: Pair;
  isActive: boolean;
  latest?: RateDoc;
  onClick: () => void;
}

function PairCard({ pair, isActive, latest, onClick }: PairCardProps) {
  const price = latest?.ttSell ? latest.ttSell.toFixed(3) : '...';

  let changePctStr = '';
  let isPositive = false;
  let isNegative = false;
  if (latest && latest.previousTtSell && latest.ttSell) {
    const diff = latest.ttSell - latest.previousTtSell;
    const pct = (diff / latest.previousTtSell) * 100;
    isPositive = pct > 0;
    isNegative = pct < 0;
    changePctStr = `${isPositive ? '+' : ''}${pct.toFixed(2)}%`;
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-white dark:bg-[#1e293b] border-indigo-500 ring-1 ring-indigo-500/20 shadow-lg'
          : 'bg-slate-50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
          {FLAGS[pair]} {pair} / {FLAGS.TWD} TWD
        </span>
        {changePctStr ? (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : isNegative ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'}`}>
            {changePctStr}
          </span>
        ) : (
          <span className="text-[10px] bg-slate-500/10 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">
            Live
          </span>
        )}
      </div>
      <div className={`text-2xl font-mono font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
        {price}
      </div>
      <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">TT Sell Price</div>
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  activePair: Pair;
  latestRates: Record<string, RateDoc>;
  onSelectPair: (pair: Pair) => void;
  onClose: () => void;
}

export function Sidebar({ isOpen, activePair, latestRates, onSelectPair, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden absolute inset-0 z-40 bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`absolute md:relative inset-y-0 left-0 z-50 w-64 md:w-72 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 flex flex-col gap-6 shrink-0 shadow-2xl md:shadow-none overflow-y-auto`}>
        <div className="flex justify-between items-center md:hidden mb-2">
          <span className="font-bold text-slate-900 dark:text-white">Select Pair</span>
          <button onClick={onClose} className="p-2 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <section>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3 hidden md:block">Tracked Pairs</label>
          <div className="space-y-3 flex flex-col gap-3">
            {PAIRS.map(pair => (
              <React.Fragment key={pair}>
                <PairCard
                  pair={pair}
                  isActive={activePair === pair}
                  latest={latestRates[pair]}
                  onClick={() => onSelectPair(pair)}
                />
              </React.Fragment>
            ))}
          </div>
        </section>
      </aside>
    </>
  );
}
