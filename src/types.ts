export type Pair = 'SGD' | 'USD';
export type Interval = '30m' | '1h' | '12h' | '1d' | '1w' | 'custom';

export interface RateDoc {
  currency: string;
  timestamp: string;
  ttSell: number;
  ttBuy?: number;
  previousTtSell?: number;
}

export const FLAGS: Record<string, string> = {
  SGD: '🇸🇬',
  USD: '🇺🇸',
  TWD: '🇹🇼',
};

export const INTERVALS: Interval[] = ['30m', '1h', '12h', '1d', '1w', 'custom'];
export const PAIRS: Pair[] = ['SGD', 'USD'];
