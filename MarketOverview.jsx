import { Activity, DollarSign, Target, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function MarketOverview({ stocks, crypto }) {
  const stats = useMemo(() => {
    const allAssets = [...stocks, ...crypto];
    const winners = allAssets.filter((a) => a.price >= a.basePrice).length;
    const avgChange =
      allAssets.reduce((s, a) => s + ((a.price - a.basePrice) / a.basePrice) * 100, 0) / allAssets.length;
    const btc = crypto.find((c) => c.symbol === 'BTC');
    const btcDominance = btc ? (((btc.price * 19.6e6) / 2.4e12) * 100).toFixed(1) : '—';

    return [
      {
        label: 'AURA INDEX',
        value: (1000 + avgChange * 8.2).toFixed(2),
        change: avgChange,
        icon: Activity,
        accent: 'primary',
      },
      {
        label: 'WINNERS / TOTAL',
        value: `${winners} / ${allAssets.length}`,
        sub: `${((winners / allAssets.length) * 100).toFixed(0)}% bullish`,
        icon: Target,
        accent: winners >= allAssets.length / 2 ? 'gain' : 'loss',
      },
      {
        label: 'BTC DOMINANCE',
        value: `${btcDominance}%`,
        sub: 'Global crypto cap',
        icon: DollarSign,
        accent: 'warning',
      },
      {
        label: 'ALPHA SIGNAL',
        value: Math.abs(avgChange) > 1.5 ? 'ELEVATED' : 'NEUTRAL',
        sub: `σ ${Math.abs(avgChange).toFixed(2)}%`,
        icon: Zap,
        accent: Math.abs(avgChange) > 1.5 ? 'loss' : 'primary',
      },
    ];
  }, [stocks, crypto]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-xl p-4 relative overflow-hidden">
          <div className={cn(
            'absolute top-0 right-0 h-20 w-20 rounded-full blur-2xl opacity-20 -translate-y-6 translate-x-6',
            s.accent === 'gain' && 'bg-gain',
            s.accent === 'loss' && 'bg-loss',
            s.accent === 'warning' && 'bg-warning',
            s.accent === 'primary' && 'bg-primary',
          )} />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">{s.label}</span>
            <s.icon className={cn(
              'h-3.5 w-3.5',
              s.accent === 'gain' && 'text-gain',
              s.accent === 'loss' && 'text-loss',
              s.accent === 'warning' && 'text-warning',
              s.accent === 'primary' && 'text-primary',
            )} />
          </div>
          <div className="font-mono-num text-2xl font-bold tracking-tight">{s.value}</div>
          {s.change !== undefined && (
            <div className={cn(
              'font-mono-num text-[11px] font-semibold mt-1',
              s.change >= 0 ? 'text-gain' : 'text-loss'
            )}>
              {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}% · 24h
            </div>
          )}
          {s.sub && <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}
