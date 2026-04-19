import { useMemo } from 'react';

export default function CandlestickChart({ candles, sma50, rsi, showSMA, showRSI }) {
  const WIDTH = 1000;
  const MAIN_HEIGHT = 360;
  const RSI_HEIGHT = showRSI ? 80 : 0;
  const GAP = showRSI ? 12 : 0;
  const HEIGHT = MAIN_HEIGHT + GAP + RSI_HEIGHT;
  const PADDING_Y = 16;

  const { minPrice, maxPrice, candleWidth } = useMemo(() => {
    const prices = candles.flatMap((c) => [c.high, c.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = (max - min) * 0.08;
    return {
      minPrice: min - pad,
      maxPrice: max + pad,
      candleWidth: (WIDTH / candles.length) * 0.72,
    };
  }, [candles]);

  const priceToY = (p) => {
    const innerH = MAIN_HEIGHT - PADDING_Y * 2;
    return PADDING_Y + ((maxPrice - p) / (maxPrice - minPrice)) * innerH;
  };

  const candleX = (i) => (i + 0.5) * (WIDTH / candles.length);

  // SMA path
  const smaPath = useMemo(() => {
    if (!showSMA) return '';
    let path = '';
    let started = false;
    sma50.forEach((v, i) => {
      if (v === null) return;
      const x = candleX(i);
      const y = priceToY(v);
      path += `${started ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `;
      started = true;
    });
    return path;
  }, [sma50, showSMA, candles]);

  // Grid lines (price)
  const gridLines = useMemo(() => {
    const lines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const price = minPrice + ((maxPrice - minPrice) * i) / steps;
      lines.push({ price, y: priceToY(price) });
    }
    return lines;
  }, [minPrice, maxPrice]);

  // RSI path
  const rsiTop = MAIN_HEIGHT + GAP;
  const rsiPath = useMemo(() => {
    if (!showRSI) return '';
    let path = '';
    let started = false;
    rsi.forEach((v, i) => {
      if (v === null || v === undefined) return;
      const x = candleX(i);
      const y = rsiTop + 8 + ((100 - v) / 100) * (RSI_HEIGHT - 16);
      path += `${started ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `;
      started = true;
    });
    return path;
  }, [rsi, showRSI, candles]);

  const formatY = (p) => {
    if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (p >= 10) return p.toFixed(2);
    return p.toFixed(3);
  };

  const lastCandle = candles[candles.length - 1];
  const lastY = priceToY(lastCandle.close);
  const lastIsUp = lastCandle.close >= lastCandle.open;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" preserveAspectRatio="none">
        {/* Grid */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1="0"
              x2={WIDTH}
              y1={g.y}
              y2={g.y}
              stroke="hsl(var(--border))"
              strokeOpacity="0.4"
              strokeDasharray="2 4"
            />
            <text
              x={WIDTH - 4}
              y={g.y - 3}
              fill="hsl(var(--muted-foreground))"
              fontSize="10"
              fontFamily="var(--font-mono)"
              textAnchor="end"
            >
              {formatY(g.price)}
            </text>
          </g>
        ))}

        {/* Candles */}
        {candles.map((c, i) => {
          const x = candleX(i);
          const up = c.close >= c.open;
          const color = up ? 'hsl(var(--gain))' : 'hsl(var(--loss))';
          const bodyTop = priceToY(Math.max(c.open, c.close));
          const bodyBottom = priceToY(Math.min(c.open, c.close));
          const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
          return (
            <g key={i}>
              <line
                x1={x}
                x2={x}
                y1={priceToY(c.high)}
                y2={priceToY(c.low)}
                stroke={color}
                strokeWidth="1"
              />
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={up ? color : color}
                fillOpacity={up ? 0.9 : 1}
                stroke={color}
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* SMA */}
        {showSMA && (
          <path
            d={smaPath}
            fill="none"
            stroke="hsl(var(--chart-4))"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Last price line */}
        <line
          x1="0"
          x2={WIDTH}
          y1={lastY}
          y2={lastY}
          stroke={lastIsUp ? 'hsl(var(--gain))' : 'hsl(var(--loss))'}
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.5"
        />
        <rect
          x={WIDTH - 70}
          y={lastY - 9}
          width="66"
          height="18"
          rx="3"
          fill={lastIsUp ? 'hsl(var(--gain))' : 'hsl(var(--loss))'}
        />
        <text
          x={WIDTH - 37}
          y={lastY + 4}
          fill="hsl(var(--background))"
          fontSize="11"
          fontFamily="var(--font-mono)"
          fontWeight="700"
          textAnchor="middle"
        >
          {formatY(lastCandle.close)}
        </text>

        {/* RSI pane */}
        {showRSI && (
          <g>
            <rect
              x="0"
              y={rsiTop}
              width={WIDTH}
              height={RSI_HEIGHT}
              fill="hsl(var(--background))"
              fillOpacity="0.3"
              stroke="hsl(var(--border))"
              strokeOpacity="0.4"
            />
            {/* 70 and 30 levels */}
            {[70, 30].map((lvl) => {
              const y = rsiTop + 8 + ((100 - lvl) / 100) * (RSI_HEIGHT - 16);
              return (
                <g key={lvl}>
                  <line
                    x1="0"
                    x2={WIDTH}
                    y1={y}
                    y2={y}
                    stroke={lvl === 70 ? 'hsl(var(--loss))' : 'hsl(var(--gain))'}
                    strokeOpacity="0.3"
                    strokeDasharray="2 3"
                  />
                  <text
                    x="4"
                    y={y - 2}
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                    fill={lvl === 70 ? 'hsl(var(--loss))' : 'hsl(var(--gain))'}
                    opacity="0.7"
                  >
                    {lvl}
                  </text>
                </g>
              );
            })}
            <path
              d={rsiPath}
              fill="none"
              stroke="hsl(var(--chart-3))"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="4"
              y={rsiTop + 14}
              fontSize="10"
              fontFamily="var(--font-mono)"
              fontWeight="600"
              fill="hsl(var(--muted-foreground))"
            >
              RSI (14)
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
