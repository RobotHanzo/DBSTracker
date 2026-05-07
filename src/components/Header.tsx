import { Activity, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  effectiveDate: string;
  onToggleTheme: () => void;
}

export function Header({ theme, effectiveDate, onToggleTheme }: HeaderProps) {
  return (
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
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Last Updated</div>
          <div className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
            {effectiveDate || 'WAITING...'}
          </div>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
