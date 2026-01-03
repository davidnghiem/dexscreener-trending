import { NextResponse } from 'next/server';

// Supported chains on DexScreener
const SUPPORTED_CHAINS = [
  'solana', 'ethereum', 'bsc', 'base', 'polygon', 'arbitrum', 'avalanche',
  'optimism', 'ton', 'sui', 'abstract', 'cronos', 'hyperliquid', 'sonic',
  'fantom', 'linea', 'tron', 'mantle', 'aptos', 'seiv2', 'zksync', 'blast',
  'moonbeam', 'celo', 'scroll', 'mode', 'manta', 'aurora', 'monad', 'pulsechain'
];

interface TokenInfo {
  chain: string;
  contract_address: string;
  token_name: string;
  token_symbol: string;
  pair_address: string;
  price_usd: string | null;
  market_cap: number | null;
  liquidity_usd: number | null;
  volume_24h: number | null;
  age: string | null;
  age_hours: number | null;
  dexscreener_url: string;
  twitter_url: string | null;
  price_change: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  txns_24h: {
    buys?: number;
    sells?: number;
  };
  makers_24h: number | null;
}

async function getTokenInfoFromPair(chain: string, pairAddress: string): Promise<TokenInfo | null> {
  const apiUrl = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      const baseToken = pair.baseToken || {};
      
      // Calculate age
      let ageStr: string | null = null;
      let ageHours: number | null = null;
      
      if (pair.pairCreatedAt) {
        const createdTime = new Date(pair.pairCreatedAt);
        const now = new Date();
        const diffMs = now.getTime() - createdTime.getTime();
        ageHours = diffMs / (1000 * 60 * 60);
        
        if (ageHours < 1) {
          ageStr = `${Math.floor(diffMs / (1000 * 60))}m`;
        } else if (ageHours < 24) {
          ageStr = `${Math.floor(ageHours)}h`;
        } else if (ageHours < 24 * 30) {
          ageStr = `${Math.floor(ageHours / 24)}d`;
        } else if (ageHours < 24 * 365) {
          ageStr = `${Math.floor(ageHours / 24 / 30)}mo`;
        } else {
          ageStr = `${Math.floor(ageHours / 24 / 365)}y`;
        }
      }
      
      // Extract Twitter/X URL from info object
      const twitterUrl = pair.info?.socials?.find((s: any) =>
        s.type === 'twitter' || s.platform === 'twitter'
      )?.url || null;

      return {
        chain,
        contract_address: baseToken.address,
        token_name: baseToken.name || 'Unknown',
        token_symbol: baseToken.symbol || '???',
        pair_address: pairAddress,
        price_usd: pair.priceUsd,
        market_cap: pair.marketCap,
        liquidity_usd: pair.liquidity?.usd,
        volume_24h: pair.volume?.h24 || null,
        age: ageStr,
        age_hours: ageHours,
        dexscreener_url: `https://dexscreener.com/${chain}/${pairAddress}`,
        twitter_url: twitterUrl,
        price_change: {
          m5: pair.priceChange?.m5,
          h1: pair.priceChange?.h1,
          h6: pair.priceChange?.h6,
          h24: pair.priceChange?.h24,
        },
        txns_24h: {
          buys: pair.txns?.h24?.buys,
          sells: pair.txns?.h24?.sells,
        },
        makers_24h: pair.txns?.h24?.makers || null,
      };
    }
  } catch (error) {
    console.error(`Error fetching pair ${pairAddress}:`, error);
  }
  
  return null;
}

async function getTrendingPairsFromHomepage(): Promise<Array<{ chain: string; pairAddress: string }>> {
  try {
    const response = await fetch('https://dexscreener.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    
    if (!response.ok) return [];
    
    const html = await response.text();
    
    // Build regex pattern for chains
    const chainsPattern = SUPPORTED_CHAINS.join('|');
    const linkPattern = new RegExp(`\\]\\(/(${chainsPattern})/([a-zA-Z0-9x]+)\\)`, 'gi');
    const hrefPattern = new RegExp(`href="/(${chainsPattern})/([a-zA-Z0-9x]+)"`, 'gi');
    
    const pairs: Array<{ chain: string; pairAddress: string }> = [];
    const seen = new Set<string>();
    
    // Find matches with both patterns
    const allMatches = [
      ...html.matchAll(linkPattern),
      ...html.matchAll(hrefPattern),
    ];
    
    for (const match of allMatches) {
      const chain = match[1].toLowerCase();
      const pairAddress = match[2];
      const key = `${chain}:${pairAddress.toLowerCase()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push({ chain, pairAddress });
      }
    }
    
    return pairs;
  } catch (error) {
    console.error('Error fetching homepage:', error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get('chain');
  const limitParam = searchParams.get('limit');
  const limit = Math.min(limitParam ? parseInt(limitParam) : 50, 50); // Cap at 50
  
  try {
    // Get trending pairs from homepage
    let pairs = await getTrendingPairsFromHomepage();
    
    // Filter by chain if specified
    if (chain) {
      pairs = pairs.filter(p => p.chain === chain.toLowerCase());
    }
    
    // Limit pairs to process (fetch a few extra in case of duplicates)
    pairs = pairs.slice(0, Math.min(limit + 10, 60));
    
    // Resolve token addresses via API (in batches to be faster)
    const tokens: TokenInfo[] = [];
    const seenTokens = new Set<string>();
    
    // Process in parallel batches of 10
    const batchSize = 10;
    for (let i = 0; i < pairs.length; i += batchSize) {
      const batch = pairs.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(({ chain, pairAddress }) => getTokenInfoFromPair(chain, pairAddress))
      );
      
      for (const tokenInfo of results) {
        if (tokenInfo && tokenInfo.contract_address) {
          const tokenKey = `${tokenInfo.chain}:${tokenInfo.contract_address.toLowerCase()}`;
          if (!seenTokens.has(tokenKey)) {
            seenTokens.add(tokenKey);
            tokens.push(tokenInfo);
            
            // Stop if we've reached the limit
            if (tokens.length >= limit) break;
          }
        }
      }
      
      // Stop processing batches if we've reached the limit
      if (tokens.length >= limit) break;
      
      // Small delay between batches
      if (i + batchSize < pairs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: tokens.length,
      tokens,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending tokens' },
      { status: 500 }
    );
  }
}
