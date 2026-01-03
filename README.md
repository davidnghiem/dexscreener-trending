# DexScreener Trending Tokens - Web App

A Next.js web application that fetches trending token contract addresses from DexScreener with a clean, easy-to-use interface.

![Screenshot](screenshot.png)

## Features

- 🔍 **One-Click Fetch** - Get all trending tokens with a single button click
- 📋 **Easy Copy** - Copy individual addresses or all at once
- 🔗 **Chain Filter** - Filter by specific blockchain (Solana, Ethereum, BSC, etc.)
- 📊 **Rich Data** - Shows token symbol, name, age, and market cap
- 📥 **CSV Export** - Download results as a CSV file
- 🔗 **Direct Links** - Quick links to DexScreener for each token

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/dexscreener-trending)

### Option 2: Manual Deploy

1. **Push to GitHub**
   ```bash
   cd dexscreener-web
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/dexscreener-trending.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

That's it! Vercel will automatically build and deploy your app.

## Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
dexscreener-web/
├── app/
│   ├── api/
│   │   └── trending/
│   │       └── route.ts    # API endpoint that fetches from DexScreener
│   ├── globals.css         # Global styles with Tailwind
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page with UI
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## API Endpoint

The app includes an API route at `/api/trending` that you can also use directly:

```bash
# Get all trending tokens
GET /api/trending

# Filter by chain
GET /api/trending?chain=solana

# Limit results
GET /api/trending?limit=20
```

### Response Format

```json
{
  "timestamp": "2025-01-02T12:00:00.000Z",
  "total": 50,
  "tokens": [
    {
      "chain": "solana",
      "contract_address": "8iMCGwYvVqu8TfB8FYpLe6mWULJcAonkvn4ySbonkPJH",
      "token_name": "Justice for Marlee",
      "token_symbol": "Marlee",
      "age": "7h",
      "market_cap": 1800000,
      "price_usd": "0.001803",
      "dexscreener_url": "https://dexscreener.com/solana/..."
    }
  ]
}
```

## Environment Variables

No environment variables required! The app fetches directly from DexScreener's public API.

## Rate Limits

- DexScreener API: 300 requests/minute
- The app processes tokens in batches to stay within limits
- Typical fetch takes 10-20 seconds for 50 tokens

## Customization

### Change the number of tokens fetched

In `app/page.tsx`, modify the `limit` parameter:

```typescript
params.set('limit', '100'); // Fetch up to 100 tokens
```

### Add more chain options

In `app/page.tsx`, add to the select dropdown:

```tsx
<option value="optimism">Optimism</option>
<option value="fantom">Fantom</option>
```

## License

MIT
