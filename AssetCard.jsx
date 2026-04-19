import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import PriceTicker from './PriceTicker';
import Sparkline from './Sparkline';
import { formatPct } from '@/lib/marketData';

export default function AssetCard({ asset, onClick, isSelected, pricePrefix = '$' }) {
  const pct = ((asset.price - asset.basePrice) / asset.basePrice) * 100;
  const isPositive = pct >= 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full text-left glass rounded-xl p-4 transition-all duration-300',
        'hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.3)]',
        isSelected && 'border-primary/50 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.5)] ring-1 ring-primary/30'
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight">{asset.symbol}</span>
            {asset.riskScore !== undefined && (
              <span className={cn(
                'font-mono-num text-[9px] px-1.5 py-0.5 rounded font-bold',
                asset.riskScore >= 9 ? 'bg-loss/20 text-loss' :
                asset.riskScore >= 7 ? 'bg-warning/20 text-warning' :
                'bg-primary/20 text-primary'
              )}>
                R{asset.riskScore}
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground truncate mt-0.5">{asset.name}</div>
        </div>
        <div className={cn(
          'flex items-center gap-0.5 font-mono-num text-xs font-semibold px-1.5 py-0.5 rounded',
          isPositive ? 'text-gain bg-gain/10' : 'text-loss bg-loss/10'
        )}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {formatPct(pct)}
        </div>
      </div>

      {/* Price */}
      <div className="mb-2">
        <PriceTicker price={asset.price} prefix={pricePrefix} size="md" />
      </div>

      {/* Sparkline */}
      <div className="flex items-end justify-between gap-2">
        <div className="text-[9px] text-muted-foreground/70 tracking-widest font-mono-num">
          {asset.sector || asset.marketCap}
        </div>
        <Sparkline data={asset.sparkline} isPositive={isPositive} width={80} height={24} />
      </div>
    </button>
  );
}
