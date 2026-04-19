import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RiskMatrix({ crypto }) {
  return (
    <section className="glass-strong rounded-2xl p-5">
      <header className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-4 w-4 text-loss" />
        <h3 className="text-sm font-bold tracking-tight">Risk Matrix</h3>
        <span className="ml-auto text-[10px] font-mono-num text-muted-foreground tracking-widest">VOL · RISK · TIER</span>
      </header>
      <div className="space-y-2">
        {crypto.map((c) => {
          const riskPct = (c.riskScore / 10) * 100;
          const color = c.riskScore >= 9 ? 'loss' : c.riskScore >= 7 ? 'warning' : 'primary';
          return (
            <div key={c.symbol} className="flex items-center gap-3">
              <div className="w-12 font-mono-num text-xs font-bold">{c.symbol}</div>
              <div className="flex-1 h-2 rounded-full bg-secondary/80 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    color === 'loss' && 'bg-loss shadow-[0_0_8px_hsl(var(--loss))]',
                    color === 'warning' && 'bg-warning shadow-[0_0_8px_hsl(var(--warning))]',
                    color === 'primary' && 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]',
                  )}
                  style={{ width: `${riskPct}%` }}
                />
              </div>
              <div className={cn(
                'w-8 text-right font-mono-num text-xs font-bold',
                color === 'loss' && 'text-loss',
                color === 'warning' && 'text-warning',
                color === 'primary' && 'text-primary',
              )}>
                {c.riskScore}/10
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border/40 text-[10px] text-muted-foreground leading-relaxed">
        Risk scores are proprietary composite metrics based on 30-day realized volatility, drawdown depth, and liquidity.
        Scores ≥ 9 indicate extreme tail risk — position sizing recommended.
      </div>
    </section>
  );
}
