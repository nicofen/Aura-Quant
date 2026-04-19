import { cn } from '@/lib/utils';
import { formatPrice, formatPct } from '@/lib/marketData';

export default function TopTicker({ assets }) {
  // Duplicate for seamless scroll
  const items = [...assets, ...assets];

  return (
    <div className="relative overflow-hidden border-b border-border/40 bg-card/40 backdrop-blur-md">
      <div className="flex ticker-scroll whitespace-nowrap py-2">
        {items.map((a, i) => {
          const pct = ((a.price - a.basePrice) / a.basePrice) * 100;
          const isUp = pct >= 0;
          return (
            <div key={`${a.symbol}-${i}`} className="flex items-center gap-2 px-5 text-xs border-r border-border/30">
              <span className="font-bold tracking-tight text-foreground">{a.symbol}</span>
              <span className="font-mono-num text-muted-foreground">
                {a.symbol === 'BTC' || a.symbol === 'ETH' || a.riskScore ? '$' : '$'}
                {formatPrice(a.price)}
              </span>
              <span className={cn('font-mono-num font-semibold', isUp ? 'text-gain' : 'text-loss')}>
                {formatPct(pct)}
              </span>
            </div>
          );
        })}
      </div>
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
