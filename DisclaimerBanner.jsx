import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="relative z-50 bg-gradient-to-r from-loss/10 via-loss/20 to-loss/10 border-b border-loss/30 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 text-[11px] md:text-xs tracking-wide">
        <AlertTriangle className="h-3.5 w-3.5 text-loss shrink-0 animate-pulse" />
        <p className="text-foreground/90 font-medium">
          <span className="text-loss font-bold">DISCLAIMER:</span>{' '}
          <span className="text-muted-foreground">
            Aura Capital provides data and analysis for informational purposes only. We are{' '}
          </span>
          <span className="text-loss font-semibold">NOT financial advisors.</span>{' '}
          <span className="text-muted-foreground">Invest at your own risk.</span>
        </p>
      </div>
    </div>
  );
}
