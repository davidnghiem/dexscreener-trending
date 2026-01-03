# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js web application that fetches and displays trending cryptocurrency tokens from DexScreener. The app scrapes the DexScreener homepage for trending pairs, then resolves each pair to its base token contract address via the DexScreener API. Provides filtering, multi-selection, CSV export, and rich token data display.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## Architecture

### Data Flow

1. **Homepage Scraping** (`app/api/trending/route.ts`):
   - Fetches DexScreener homepage HTML
   - Uses regex patterns to extract trending pair links: `/(chain)/(pairAddress)`
   - Supports 30+ chains (see `SUPPORTED_CHAINS` array)

2. **Token Resolution** (`getTokenInfoFromPair`):
   - For each pair, calls DexScreener API: `/latest/dex/pairs/{chain}/{pairAddress}`
   - Extracts base token contract address (NOT the pair address)
   - Processes in parallel batches of 10 pairs to respect rate limits (300 req/min)
   - Deduplicates tokens by chain + contract address

3. **Client-Side Filtering** (`app/page.tsx`):
   - API endpoint supports single-chain filtering via `?chain=` param
   - Client handles multi-chain selection, market cap, liquidity, and age filters
   - Age parsing handles multiple formats: `5m`, `2h`, `1d`, `3mo`, `1y`

### Key Components

**API Route** (`app/api/trending/route.ts`):
- `getTrendingPairsFromHomepage()`: Scrapes homepage, returns `{chain, pairAddress}[]`
- `getTokenInfoFromPair(chain, pairAddress)`: Resolves to `TokenInfo` object
- Processes pairs in batches with 100ms delays between batches
- Returns deduplicated tokens capped at 50

**Main UI** (`app/page.tsx`):
- Single-page React component using Next.js App Router
- Client-side state management with React hooks
- Multi-select chain filters with colored badges
- Token selection with checkboxes for bulk copy operations
- CSV export functionality with all token data

### Token Interface

The `TokenInfo` interface includes:
- Basic: `chain`, `contract_address`, `token_name`, `token_symbol`
- Metrics: `market_cap`, `liquidity_usd`, `volume_24h`, `age`
- Price changes: `m5`, `h1`, `h6`, `h24` (in percentage)
- Transactions: `buys`, `sells`, `makers_24h`
- Links: `dexscreener_url`, `twitter_url`

### Age Parsing Logic

Important: Age regex must match `mo` (months) BEFORE `m` (minutes) to avoid false matches:
```typescript
const match = age.match(/(\d+)(mo|m|h|d|y)/);
```

Conversion to hours:
- `m` → divide by 60
- `h` → as-is
- `d` → multiply by 24
- `mo` → multiply by 720 (30 days)
- `y` → multiply by 8760 (365 days)

## Styling

- Tailwind CSS with dark theme gradient (`from-gray-900 via-gray-900 to-gray-800`)
- Chain-specific color schemes for badges and buttons (purple=Solana, blue=Ethereum, etc.)
- Responsive table with hover tooltips for price change breakdowns
- Glassmorphism effects (`backdrop-blur-sm`, `bg-gray-800/50`)

## API Rate Limits

DexScreener API: 300 requests/minute
- Current batch processing: 10 pairs in parallel, 100ms delay between batches
- Typical fetch time: 10-30 seconds for 50 tokens
- No API key required (public endpoint)

## Important Notes

- The app fetches **token contract addresses**, not pair addresses
- Duplicate tokens across different pairs are filtered out
- Pairs are fetched from homepage scraping (no official trending API exists)
- Client-side filtering allows combining multiple chains without re-fetching
- All external links use `target="_blank"` with `rel="noopener noreferrer"`
