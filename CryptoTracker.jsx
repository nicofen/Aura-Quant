import { Bitcoin, ShieldAlert } from 'lucide-react';
import AssetCard from './AssetCard';

export default function CryptoTracker({ assets, selected, onSelect }) {
  const blueChips = assets.filter((a) => a.tier === 'blue-chip');
  const altcoins = assets.filter((a) => a.tier === 'altcoin');

  return (
    <section className="glass-strong rounded-2xl p-5">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
            <Bitcoin className="h-4 w-4 text-warning" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">High-Risk Asset Tracker</h2>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-loss bg-loss/10 px-1.5 py-0.5 rounded">
                <ShieldAlert className="h-2.5 w-2.5" /> VOLATILE
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Digital assets · Risk scored 1–10 · 24/7 markets
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="h-1.5 w-1.5 rounded-full bg-gain pulse-dot text-gain" />
          <span className="font-mono-num tracking-widest">LIVE · GLOBAL</span>
        </div>
      </header>

      <div className="space-y-4">
        <div>
          <div className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/70 mb-2">BLUE-CHIP</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blueChips.map((asset) => (
              <AssetCard
                key={asset.symbol}
                asset={asset}
                isSelected={selected === asset.symbol}
                onClick={() => onSelect(asset.symbol)}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/70 mb-2">TRENDING ALTCOINS</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {altcoins.map((asset) => (
              <AssetCard
                key={asset.symbol}
                asset={asset}
                isSelected={selected === asset.symbol}
                onClick={() => onSelect(asset.symbol)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
