import { useEffect, useState, useRef } from 'react';
import { nextTick, generateSparkline } from '@/lib/marketData';

// Hook that simulates live-updating asset prices
export function useLiveAssets(initialAssets, intervalMs = 1500) {
  const [assets, setAssets] = useState(() =>
    initialAssets.map((a, i) => ({
      ...a,
      price: a.basePrice,
      sparkline: generateSparkline(a.basePrice, a.volatility, i + 1),
    }))
  );
  const assetsRef = useRef(assets);
  assetsRef.current = assets;

  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((a) => {
          // Only tick a subset each cycle for more realistic "staggered" feel
          if (Math.random() > 0.55) return a;
          const newPrice = nextTick(a.price, a.volatility);
          const newSpark = [...a.sparkline.slice(1), newPrice];
          return { ...a, price: newPrice, sparkline: newSpark };
        })
      );
    }, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return assets;
}
