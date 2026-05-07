import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

interface ChartProps {
  data: { time: number; open: number; high: number; low: number; close: number }[];
  isDark: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg text-xs font-mono">
        <div className="text-slate-500 dark:text-slate-400 mb-2">{format(data.time, 'MMM dd, HH:mm')}</div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">Open:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{data.open.toFixed(4)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">High:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{data.high.toFixed(4)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">Low:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{data.low.toFixed(4)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">Close:</span> <span className="font-bold text-slate-800 dark:text-slate-100">{data.close.toFixed(4)}</span></div>
      </div>
    );
  }
  return null;
};

const ANIM_STYLE = `
@keyframes candle-wick-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes candle-body-in {
  from { opacity: 0; transform: scaleY(0); }
  to   { opacity: 1; transform: scaleY(1); }
}
`;

// Rendered by Recharts — receives staggerMs from the shape factory
const Candlestick = (props: any) => {
  const { x, y, width, height, payload, index, staggerMs } = props;
  const { open, close, high, low } = payload;

  const isGrowing = close >= open;
  const color = isGrowing ? '#10b981' : '#f43f5e';

  const range = high - low;
  const ratio = range === 0 ? 0 : height / range;

  const openY  = y + (high - open)  * ratio;
  const closeY = y + (high - close) * ratio;

  const bodyTop    = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(openY - closeY), 1);

  const centerX   = x + width / 2;
  const wickWidth = Math.max(width * 0.05, 1);

  // Each candle starts after the previous one has fully finished
  const wickDelay = index * staggerMs;
  const bodyDelay = wickDelay + Math.round(staggerMs * 0.4); // body starts after wick

  // openY is the correct transform-origin for both directions:
  //   bullish → openY = bottom of body → grows upward
  //   bearish → openY = top of body   → grows downward
  const bodyOriginY = openY;

  return (
    <g>
      <line
        x1={centerX} y1={y} x2={centerX} y2={y + height}
        stroke={color} strokeWidth={wickWidth}
        style={{ animation: `candle-wick-in ${Math.round(staggerMs * 0.4)}ms ease-out ${wickDelay}ms both` }}
      />
      <rect
        x={x + width * 0.1}
        y={bodyTop}
        width={width * 0.8}
        height={bodyHeight}
        fill={color} rx={1}
        style={{
          transformOrigin: `${centerX}px ${bodyOriginY}px`,
          animation: `candle-body-in ${Math.round(staggerMs * 0.6)}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${bodyDelay}ms both`,
        }}
      />
    </g>
  );
};

export function CandleChart({ data, isDark }: ChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      lowHigh: [d.low, d.high]
    }));
  }, [data]);

  // Sequential one-by-one: each candle gets staggerMs to complete before the next starts.
  // Total budget = 3s max, so stagger = min(3000 / n, 120ms).
  const staggerMs = useMemo(
    () => Math.min(120, Math.round(3000 / Math.max(data.length, 1))),
    [data.length]
  );

  // Shape factory so Candlestick receives staggerMs without React context
  const CandlestickShape = useMemo(
    () => (props: any) => <Candlestick {...props} staggerMs={staggerMs} />,
    [staggerMs]
  );

  const yMin = Math.min(...data.map(d => d.low));
  const yMax = Math.max(...data.map(d => d.high));
  const padding = (yMax - yMin) * 0.1 || 0.01;

  if (!data || data.length === 0) return null;

  return (
    <>
      <style>{ANIM_STYLE}</style>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} vertical={false} />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => format(time, 'HH:mm')}
            stroke={isDark ? '#64748b' : '#94a3b8'}
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12 }}
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis
            domain={[yMin - padding, yMax + padding]}
            orientation="right"
            stroke={isDark ? '#64748b' : '#94a3b8'}
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
            tickFormatter={(val) => val.toFixed(3)}
            tickMargin={10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
          <Bar dataKey="lowHigh" shape={<CandlestickShape />} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
