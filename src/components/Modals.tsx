interface DisclaimerModalProps {
  onClose: () => void;
}

export function DisclaimerModal({ onClose }: DisclaimerModalProps) {
  return (
    <div
      className="sm:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Disclaimer</h3>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mb-6">
          This website is in no way affiliated with DBS, the information is provided as-is without any liabilities attributable to the author.
        </p>
        <button
          className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

interface CustomIntervalModalProps {
  customVal: number;
  customUnit: 'm' | 'h' | 'd';
  onChangeVal: (val: number) => void;
  onChangeUnit: (unit: 'm' | 'h' | 'd') => void;
  onClose: () => void;
}

export function CustomIntervalModal({
  customVal,
  customUnit,
  onChangeVal,
  onChangeUnit,
  onClose,
}: CustomIntervalModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Custom Interval</h3>
        <div className="flex gap-4 mb-6">
          <input
            type="number"
            min="1"
            value={customVal}
            onChange={(e) => onChangeVal(Number(e.target.value) || 1)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={customUnit}
            onChange={(e) => onChangeUnit(e.target.value as 'm' | 'h' | 'd')}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="m">Minutes</option>
            <option value="h">Hours</option>
            <option value="d">Days</option>
          </select>
        </div>
        <button
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors"
          onClick={onClose}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
