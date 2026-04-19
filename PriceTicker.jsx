import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/marketData';

export default function PriceTicker({ price, prefix = '', className = '', size = 'md' }) {
  const prev = useRef(price);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (prev.current !== price) {
      setFlash(price > prev.current ? 'gain' : 'loss');
      prev.current = price;
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [price]);

  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <span
      className={cn(
        'font-mono-num font-semibold tracking-tight inline-block px-1 -mx-1 rounded transition-colors',
        sizes[size],
        flash === 'gain' && 'flash-gain',
        flash === 'loss' && 'flash-loss',
        className
      )}
    >
      {prefix}
      {formatPrice(price)}
    </span>
  );
}
