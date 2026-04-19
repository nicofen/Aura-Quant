import { LayoutDashboard, TrendingUp, Bitcoin, BarChart3, Activity, Zap, Settings, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: TrendingUp, label: 'Alpha Watchlist' },
  { icon: Bitcoin, label: 'Crypto Desk' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Activity, label: 'Signals' },
  { icon: Zap, label: 'Alerts' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 h-screen sticky top-0 border-r border-border/40 bg-card/30 backdrop-blur-xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <div className="h-4 w-4 rounded-sm bg-background/90" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gain pulse-dot text-gain" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">AURA CAPITAL</div>
            <div className="text-[10px] text-muted-foreground font-mono-num tracking-widest">TERMINAL v2.4</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/60 border border-border/50 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <span>Search ticker...</span>
          <kbd className="ml-auto font-mono-num text-[10px] px-1.5 py-0.5 rounded bg-background/60 border border-border/50">⌘K</kbd>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <div className="px-2 pb-2 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60">NAVIGATION</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group',
              item.active
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_-8px_hsl(var(--primary))]'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
            {item.active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-3 border-t border-border/40">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">MARKET STATUS</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-gain pulse-dot text-gain" />
              <span className="text-[10px] text-gain font-semibold">LIVE</span>
            </div>
          </div>
          <div className="font-mono-num text-xs text-foreground">NYSE · OPEN</div>
          <div className="font-mono-num text-[10px] text-muted-foreground mt-0.5">Closes in 3h 42m</div>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
