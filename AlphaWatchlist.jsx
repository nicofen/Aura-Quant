import { TrendingUp, Flame } from 'lucide-react';
import AssetCard from './AssetCard';

export default function AlphaWatchlist({ assets, selected, onSelect }) {
  return (
    <section className="glass-strong rounded-2xl p-5">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Alpha Watchlist</h2>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                <Flame className="h-2.5 w-2.5" /> HIGH CONVICTION
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Curated mid & small-cap hidden gems · {assets.length} positions
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-gain pulse-dot text-gain" />
          <span className="font-mono-num tracking-widest">LIVE · NYSE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3">
        {assets.map((asset) => (
          <AssetCard
            key={asset.symbol}
            asset={asset}
            isSelected={selected === asset.symbol}
            onClick={() => onSelect(asset.symbol)}
          />
        ))}
      </div>
    </section>
  );
}  
