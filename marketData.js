// marketData.js — Real-time Alpaca market data
// Replaces all mock generators with live REST + WebSocket feeds.
//
// REST (snapshots, historical bars):
//   https://data.alpaca.markets/v2
//
// WebSocket (live trades/quotes):
//   wss://stream.data.alpaca.markets/v2/iex   (free tier)
//   wss://stream.data.alpaca.markets/v2/sip   (Algo Trader Plus)
//
// Crypto WebSocket:
//   wss://stream.data.alpaca.markets/v1beta3/crypto/us
//
// Set these env vars (or inject via your build tool):
//   VITE_ALPACA_KEY    / ALPACA_API_KEY
//   VITE_ALPACA_SECRET / ALPACA_SECRET_KEY

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const KEY    = import.meta?.env?.VITE_ALPACA_KEY    ?? process.env.ALPACA_API_KEY;
const SECRET = import.meta?.env?.VITE_ALPACA_SECRET ?? process.env.ALPACA_SECRET_KEY;

const DATA_BASE  = 'https://data.alpaca.markets';
const STOCK_WS   = 'wss://stream.data.alpaca.markets/v2/iex';   // swap to /sip on paid plan
const CRYPTO_WS  = 'wss://stream.data.alpaca.markets/v1beta3/crypto/us';

const AUTH_HEADERS = {
  'APCA-API-KEY-ID':     KEY,
  'APCA-API-SECRET-KEY': SECRET,
  'Content-Type':        'application/json',
};

// ─────────────────────────────────────────────────────────────
// Static watchlist metadata  (non-price fields stay the same)
// ─────────────────────────────────────────────────────────────
export const ALPHA_WATCHLIST = [
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Data Analytics', marketCap: '52.1B' },
  { symbol: 'SOFI', name: 'SoFi Technologies',     sector: 'Fintech',        marketCap: '8.9B'  },
  { symbol: 'RKLB', name: 'Rocket Lab USA',         sector: 'Aerospace',      marketCap: '9.2B'  },
  { symbol: 'IONQ', name: 'IonQ Inc.',              sector: 'Quantum Computing', marketCap: '3.1B' },
  { symbol: 'HIMS', name: 'Hims & Hers Health',    sector: 'Telehealth',     marketCap: '4.7B'  },
  { symbol: 'CELH', name: 'Celsius Holdings',       sector: 'Consumer Goods', marketCap: '9.1B'  },
  { symbol: 'ASTS', name: 'AST SpaceMobile',        sector: 'Satellite Comms',marketCap: '7.8B'  },
  { symbol: 'MSTR', name: 'MicroStrategy',          sector: 'BTC Treasury',   marketCap: '33.4B' },
  { symbol: 'APP',  name: 'AppLovin Corp.',          sector: 'AdTech',         marketCap: '115.6B'},
  { symbol: 'RDDT', name: 'Reddit Inc.',             sector: 'Social Media',   marketCap: '26.3B' },
];

export const CRYPTO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin',    riskScore: 6,  marketCap: '1.35T', tier: 'blue-chip' },
  { symbol: 'ETH', name: 'Ethereum',   riskScore: 7,  marketCap: '461.2B',tier: 'blue-chip' },
  { symbol: 'SOL', name: 'Solana',     riskScore: 8,  marketCap: '87.4B', tier: 'altcoin'   },
  { symbol: 'AVAX',name: 'Avalanche',  riskScore: 9,  marketCap: '16.8B', tier: 'altcoin'   },
  { symbol: 'INJ', name: 'Injective',  riskScore: 10, marketCap: '2.7B',  tier: 'altcoin'   },
];

// ─────────────────────────────────────────────────────────────
// REST helpers
// ─────────────────────────────────────────────────────────────

/** GET wrapper with Alpaca auth headers */
async function alpacaGet(url) {
  const res = await fetch(url, { headers: AUTH_HEADERS });
  if (!res.ok) throw new Error(`Alpaca API ${res.status}: ${await res.text()}`);
  return res.json();
}

/**
 * Fetch snapshots for multiple stock symbols in one call.
 * Returns a map:  { PLTR: { latestTrade, latestQuote, dailyBar, prevDailyBar }, … }
 *
 * Docs: https://docs.alpaca.markets/reference/stocksnapshots-1
 */
export async function fetchStockSnapshots(symbols) {
  const qs = symbols.join(',');
  const data = await alpacaGet(`${DATA_BASE}/v2/stocks/snapshots?symbols=${qs}&feed=iex`);
  // data shape: { PLTR: { latestTrade:{p,…}, latestQuote:{ap,bp,…}, dailyBar:{o,h,l,c,v,…}, prevDailyBar:{c,…} }, … }
  return data;
}

/**
 * Fetch snapshots for crypto pairs.
 * Alpaca crypto symbols are like "BTC/USD", "ETH/USD"
 *
 * Docs: https://docs.alpaca.markets/reference/cryptosnapshots-1
 */
export async function fetchCryptoSnapshots(symbols) {
  // Convert  ['BTC','ETH']  →  'BTC/USD,ETH/USD'
  const qs = symbols.map(s => `${s}/USD`).join(',');
  const data = await alpacaGet(`${DATA_BASE}/v1beta3/crypto/us/snapshots?symbols=${qs}`);
  return data.snapshots ?? data;
}

/**
 * Fetch daily OHLCV bars for one stock symbol going back `days` calendar days.
 * Returns an array shaped like the old generateCandles() output.
 *
 * Docs: https://docs.alpaca.markets/reference/stockbars-1
 */
export async function fetchHistoricalBars(symbol, days = 90) {
  const end   = new Date().toISOString();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const url   = `${DATA_BASE}/v2/stocks/${symbol}/bars?timeframe=1Day&start=${start}&end=${end}&limit=${days}&feed=iex&adjustment=raw`;
  const data  = await alpacaGet(url);

  // Normalise to the same shape as the old generateCandles()
  return (data.bars ?? []).map(b => ({
    time:   new Date(b.t).getTime(),
    open:   b.o,
    high:   b.h,
    low:    b.l,
    close:  b.c,
    volume: b.v,
  }));
}

/**
 * Fetch daily OHLCV bars for a crypto pair (e.g. "BTC/USD").
 *
 * Docs: https://docs.alpaca.markets/reference/cryptobars-1
 */
export async function fetchCryptoHistoricalBars(symbol, days = 90) {
  const pair  = `${symbol}/USD`;
  const end   = new Date().toISOString();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const url   = `${DATA_BASE}/v1beta3/crypto/us/bars?symbols=${pair}&timeframe=1Day&start=${start}&end=${end}&limit=${days}`;
  const data  = await alpacaGet(url);

  const bars = data.bars?.[pair] ?? [];
  return bars.map(b => ({
    time:   new Date(b.t).getTime(),
    open:   b.o,
    high:   b.h,
    low:    b.l,
    close:  b.c,
    volume: b.v,
  }));
}

// ─────────────────────────────────────────────────────────────
// Sparkline — built from real daily bars (last 60 closes)
// ─────────────────────────────────────────────────────────────

/**
 * Returns an array of 60 closing prices for sparkline rendering.
 * Pass the result of fetchHistoricalBars() / fetchCryptoHistoricalBars().
 */
export function buildSparkline(bars) {
  return bars.slice(-60).map(b => b.close);
}

// Kept for backward compatibility — internally calls fetchHistoricalBars
export async function generateSparkline(symbol, isCrypto = false) {
  const bars = isCrypto
    ? await fetchCryptoHistoricalBars(symbol, 90)
    : await fetchHistoricalBars(symbol, 90);
  return buildSparkline(bars);
}

// generateCandles() alias — now fetches real data
export async function generateCandles(symbol, isCrypto = false, count = 90) {
  return isCrypto
    ? fetchCryptoHistoricalBars(symbol, count)
    : fetchHistoricalBars(symbol, count);
}

// ─────────────────────────────────────────────────────────────
// Technical indicators  (unchanged — operate on real bar arrays)
// ─────────────────────────────────────────────────────────────

export function calculateRSI(candles, period = 14) {
  const rsi = new Array(candles.length).fill(null);
  let gains = 0, losses = 0;

  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (i <= period) {
      if (change > 0) gains  += change;
      else            losses -= change;
      if (i === period) {
        const rs = gains / (losses || 1);
        rsi[i] = 100 - 100 / (1 + rs);
      }
    } else {
      const avgGain = (gains  * (period - 1) + (change > 0 ?  change : 0)) / period;
      const avgLoss = (losses * (period - 1) + (change < 0 ? -change : 0)) / period;
      gains  = avgGain;
      losses = avgLoss;
      const rs = avgGain / (avgLoss || 0.0001);
      rsi[i] = 100 - 100 / (1 + rs);
    }
  }
  return rsi;
}

export function calculateSMA(candles, period = 50) {
  return candles.map((_, i) => {
    if (i < period - 1) return null;
    const sum = candles.slice(i - period + 1, i + 1).reduce((a, c) => a + c.close, 0);
    return sum / period;
  });
}

// ─────────────────────────────────────────────────────────────
// WebSocket — live stock trades
// ─────────────────────────────────────────────────────────────

/**
 * Open a persistent WebSocket to Alpaca's stock data stream.
 *
 * @param {string[]} symbols      e.g. ['PLTR','APP','RDDT']
 * @param {Function} onTrade      called with each trade: { symbol, price, size, timestamp }
 * @param {Function} [onQuote]    called with each quote: { symbol, bidPrice, askPrice, timestamp }
 * @returns {{ close: () => void }}  call .close() to disconnect
 *
 * Docs: https://docs.alpaca.markets/docs/real-time-stock-pricing-data
 */
export function connectStockStream(symbols, onTrade, onQuote) {
  const ws = new WebSocket(STOCK_WS);
  let ready = false;

  ws.onopen = () => {
    // Must authenticate within 10 s of connection
    ws.send(JSON.stringify({ action: 'auth', key: KEY, secret: SECRET }));
  };

  ws.onmessage = (event) => {
    const messages = JSON.parse(event.data);

    for (const msg of messages) {
      switch (msg.T) {
        case 'success':
          if (msg.msg === 'authenticated' && !ready) {
            ready = true;
            // Subscribe to trades + quotes for all watchlist symbols
            ws.send(JSON.stringify({
              action: 'subscribe',
              trades: symbols,
              quotes: symbols,
            }));
          }
          break;

        case 't': // trade
          onTrade?.({
            symbol:    msg.S,
            price:     msg.p,
            size:      msg.s,
            timestamp: msg.t,
          });
          break;

        case 'q': // quote
          onQuote?.({
            symbol:    msg.S,
            bidPrice:  msg.bp,
            askPrice:  msg.ap,
            timestamp: msg.t,
          });
          break;

        case 'error':
          console.error('[Alpaca stock WS error]', msg.code, msg.msg);
          break;
      }
    }
  };

  ws.onerror = (err) => console.error('[Alpaca stock WS]', err);

  ws.onclose = ({ code, reason }) => {
    if (code !== 1000) {
      console.warn(`[Alpaca stock WS] closed (${code}: ${reason}) — reconnecting in 3s`);
      setTimeout(() => connectStockStream(symbols, onTrade, onQuote), 3000);
    }
  };

  return { close: () => ws.close(1000, 'intentional') };
}

// ─────────────────────────────────────────────────────────────
// WebSocket — live crypto trades
// ─────────────────────────────────────────────────────────────

/**
 * Open a WebSocket to Alpaca's crypto data stream.
 *
 * @param {string[]} symbols   base symbols, e.g. ['BTC','ETH','SOL']
 *                             (internally converted to 'BTC/USD' etc.)
 * @param {Function} onTrade   called with { symbol, price, size, timestamp }
 * @returns {{ close: () => void }}
 *
 * Docs: https://docs.alpaca.markets/docs/real-time-crypto-pricing-data
 */
export function connectCryptoStream(symbols, onTrade) {
  const pairs = symbols.map(s => `${s}/USD`);
  const ws    = new WebSocket(CRYPTO_WS);
  let ready   = false;

  ws.onopen = () => {
    ws.send(JSON.stringify({ action: 'auth', key: KEY, secret: SECRET }));
  };

  ws.onmessage = (event) => {
    const messages = JSON.parse(event.data);

    for (const msg of messages) {
      switch (msg.T) {
        case 'success':
          if (msg.msg === 'authenticated' && !ready) {
            ready = true;
            ws.send(JSON.stringify({ action: 'subscribe', trades: pairs }));
          }
          break;

        case 't':
          // msg.S is e.g. "BTC/USD" — strip the quote currency for the callback
          onTrade?.({
            symbol:    msg.S.split('/')[0],
            price:     msg.p,
            size:      msg.s,
            timestamp: msg.t,
          });
          break;

        case 'error':
          console.error('[Alpaca crypto WS error]', msg.code, msg.msg);
          break;
      }
    }
  };

  ws.onerror = (err) => console.error('[Alpaca crypto WS]', err);

  ws.onclose = ({ code, reason }) => {
    if (code !== 1000) {
      console.warn(`[Alpaca crypto WS] closed (${code}: ${reason}) — reconnecting in 3s`);
      setTimeout(() => connectCryptoStream(symbols, onTrade), 3000);
    }
  };

  return { close: () => ws.close(1000, 'intentional') };
}

// ─────────────────────────────────────────────────────────────
// nextTick — still useful during market-closed hours
// Falls back to the last known price ± a tiny realistic drift
// ─────────────────────────────────────────────────────────────
export function nextTick(currentPrice, volatility) {
  const drift = (Math.random() - 0.5) * volatility * currentPrice * 0.08;
  return Math.max(currentPrice + drift, currentPrice * 0.5);
}

// ─────────────────────────────────────────────────────────────
// Formatters (unchanged)
// ─────────────────────────────────────────────────────────────
export function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1)    return price.toFixed(2);
  return price.toFixed(4);
}

export function formatPct(pct) {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}
