import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CandlestickChart from './CandlestickChart';
import PriceTicker from '../market/PriceTicker';
import { generateCandles, calculateRSI, calculateSMA, nextTick, formatPct } from '@/lib/marketData';

const TIMEFRAMES = ['15M', '1H', '4H', '1D', '1W'];

export default function MainChart({ asset, pricePrefix = '$' }) {
  const [timeframe, setTimeframe] = useState('1D');
  const [showSMA, setShowSMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [candles, setCandles] = useState([]);

  // Regenerate candles when asset changes
  useEffect(() => {
    if (!asset) return;
    setCandles(generateCandles(asset.basePrice, asset.volatility, 90));
  }, [asset?.symbol]);

  // Live-update last candle with current live price
  useEffect(() => {
    if (!asset || candles.length === 0) return;
    setCandles((prev) => {
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.close = asset.price;
      last.high = Math.max(last.high, asset.price);
      last.low = Math.min(last.low, asset.price);
      updated[updated.length - 1] = last;
      return updated;
    });
  }, [asset?.price]);

  const sma50 = useMemo(() => calculateSMA(candles, 50), [candles]);
  const rsi = useMemo(() => calculateRSI(candles, 14), [candles]);

  if (!asset || candles.length === 0) return null;

  const firstClose = candles[0].close;
  const lastClose = candles[candles.length - 1].close;
  const periodPct = ((lastClose - firstClose) / firstClose) * 100;
  const isPositive = periodPct >= 0;
  const periodHigh = Math.max(...candles.map((c) => c.high));
  const periodLow = Math.min(...candles.map((c) => c.low));

  return (
    <section className="glass-strong rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight">{asset.symbol}</h2>
              <span className="text-xs text-muted-foreground">{asset.name}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <PriceTicker price={asset.price} prefix={pricePrefix} size="xl" />
              <span className={cn(
                'flex items-center gap-0.5 font-mono-num text-sm font-semibold',
                isPositive ? 'text-gain' : 'text-loss'
              )}>
                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {formatPct(periodPct)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-secondary/60 border border-border/50">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-mono-num font-semibold rounded transition-colors',
                  timeframe === tf
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-mono-num font-semibold rounded-md border transition-colors',
                showSMA
                  ? 'border-chart-4/40 bg-chart-4/10 text-chart-4'
                  : 'border-border/50 text-muted-foreground hover:text-foreground'
              )}
            >
              MA 50
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-mono-num font-semibold rounded-md border transition-colors',
                showRSI
                  ? 'border-chart-3/40 bg-chart-3/10 text-chart-3'
                  : 'border-border/50 text-muted-foreground hover:text-foreground'
              )}
            >
              RSI 14
            </button>
          </div>

          <button className="p-1.5 rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/60">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-5 py-2.5 border-b border-border/40 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
        <Stat label="24H HIGH" value={`${pricePrefix}${periodHigh.toFixed(2)}`} />
        <Stat label="24H LOW" value={`${pricePrefix}${periodLow.toFixed(2)}`} />
        <Stat label="VOLUME" value={`${(candles[candles.length - 1].volume / 1e6).toFixed(2)}M`} />
        <Stat label="MARKET CAP" value={asset.marketCap || '—'} />
      </div>

      {/* Chart */}
      <div className="p-4 grid-lines">
        <CandlestickChart
          candles={candles}
          sma50={sma50}
          rsi={rsi}
          showSMA={showSMA}
          showRSI={showRSI}
        />
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground/70 tracking-widest">{label}</span>
      <span className="font-mono-num font-semibold text-foreground">{value}</span>
    </div>
  );
}
