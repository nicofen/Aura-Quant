import { useState, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DisclaimerBanner from '@/components/layout/DisclaimerBanner';
import TopTicker from '@/components/layout/TopTicker';
import AlphaWatchlist from '@/components/market/AlphaWatchlist';
import CryptoTracker from '@/components/market/CryptoTracker';
import MainChart from '@/components/chart/MainChart';
import MarketOverview from '@/components/market/MarketOverview';
import RiskMatrix from '@/components/market/RiskMatrix';
import { useLiveAssets } from '@/hooks/useLiveAssets';
import { ALPHA_WATCHLIST, CRYPTO_ASSETS } from '@/lib/marketData';
import { Clock } from 'lucide-react';

export default function Dashboard() {
  const stocks = useLiveAssets(ALPHA_WATCHLIST, 1400);
  const crypto = useLiveAssets(CRYPTO_ASSETS, 1100);
  const [selectedSymbol, setSelectedSymbol] = useState('PLTR');

  const allAssets = useMemo(() => [...stocks, ...crypto], [stocks, crypto]);
  const selectedAsset = useMemo(
    () => allAssets.find((a) => a.symbol === selectedSymbol) || stocks[0],
    [allAssets, selectedSymbol, stocks]
  );
  const isCrypto = crypto.some((c) => c.symbol === selectedSymbol);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DisclaimerBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Top bar */}
          <div className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/40">
            <div className="flex items-center justify-between px-4 md:px-6 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight">Trading Terminal</h1>
                  <span className="text-[10px] font-mono-num font-semibold tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  High-alpha equities & digital assets · Real-time quant analysis
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span className="font-mono-num">
                    {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-gain pulse-dot text-gain" />
                  <span className="font-mono-num tracking-widest">FEED ACTIVE</span>
                </div>
              </div>
            </div>
            <TopTicker assets={allAssets} />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 space-y-5">
            <MarketOverview stocks={stocks} crypto={crypto} />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
              <div className="xl:col-span-3">
                <MainChart asset={selectedAsset} pricePrefix="$" />
              </div>
              <div className="xl:col-span-1">
                <RiskMatrix crypto={crypto} />
              </div>
            </div>

            <AlphaWatchlist
              assets={stocks}
              selected={selectedSymbol}
              onSelect={setSelectedSymbol}
            />

            <CryptoTracker
              assets={crypto}
              selected={selectedSymbol}
              onSelect={setSelectedSymbol}
            />

            <footer className="text-center py-6 text-[10px] text-muted-foreground/60 tracking-widest font-mono-num">
              AURA CAPITAL · QUANT TERMINAL · SIMULATED MARKET DATA FOR DEMONSTRATION
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
