module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/trending/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Supported chains on DexScreener
const SUPPORTED_CHAINS = [
    'solana',
    'ethereum',
    'bsc',
    'base',
    'polygon',
    'arbitrum',
    'avalanche',
    'optimism',
    'ton',
    'sui',
    'abstract',
    'cronos',
    'hyperliquid',
    'sonic',
    'fantom',
    'linea',
    'tron',
    'mantle',
    'aptos',
    'seiv2',
    'zksync',
    'blast',
    'moonbeam',
    'celo',
    'scroll',
    'mode',
    'manta',
    'aurora',
    'monad',
    'pulsechain'
];
async function getTokenInfoFromPair(chain, pairAddress) {
    const apiUrl = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`;
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            const baseToken = pair.baseToken || {};
            // Calculate age
            let ageStr = null;
            let ageHours = null;
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
            return {
                chain,
                contract_address: baseToken.address,
                token_name: baseToken.name || 'Unknown',
                token_symbol: baseToken.symbol || '???',
                pair_address: pairAddress,
                price_usd: pair.priceUsd,
                market_cap: pair.marketCap,
                liquidity_usd: pair.liquidity?.usd,
                age: ageStr,
                age_hours: ageHours,
                dexscreener_url: `https://dexscreener.com/${chain}/${pairAddress}`
            };
        }
    } catch (error) {
        console.error(`Error fetching pair ${pairAddress}:`, error);
    }
    return null;
}
async function getTrendingPairsFromHomepage() {
    try {
        const response = await fetch('https://dexscreener.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html'
            }
        });
        if (!response.ok) return [];
        const html = await response.text();
        // Build regex pattern for chains
        const chainsPattern = SUPPORTED_CHAINS.join('|');
        const linkPattern = new RegExp(`\\]\\(/(${chainsPattern})/([a-zA-Z0-9x]+)\\)`, 'gi');
        const hrefPattern = new RegExp(`href="/(${chainsPattern})/([a-zA-Z0-9x]+)"`, 'gi');
        const pairs = [];
        const seen = new Set();
        // Find matches with both patterns
        const allMatches = [
            ...html.matchAll(linkPattern),
            ...html.matchAll(hrefPattern)
        ];
        for (const match of allMatches){
            const chain = match[1].toLowerCase();
            const pairAddress = match[2];
            const key = `${chain}:${pairAddress.toLowerCase()}`;
            if (!seen.has(key)) {
                seen.add(key);
                pairs.push({
                    chain,
                    pairAddress
                });
            }
        }
        return pairs;
    } catch (error) {
        console.error('Error fetching homepage:', error);
        return [];
    }
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain');
    const limitParam = searchParams.get('limit');
    const limit = Math.min(limitParam ? parseInt(limitParam) : 50, 50); // Cap at 50
    try {
        // Get trending pairs from homepage
        let pairs = await getTrendingPairsFromHomepage();
        // Filter by chain if specified
        if (chain) {
            pairs = pairs.filter((p)=>p.chain === chain.toLowerCase());
        }
        // Limit pairs to process (fetch a few extra in case of duplicates)
        pairs = pairs.slice(0, Math.min(limit + 10, 60));
        // Resolve token addresses via API (in batches to be faster)
        const tokens = [];
        const seenTokens = new Set();
        // Process in parallel batches of 10
        const batchSize = 10;
        for(let i = 0; i < pairs.length; i += batchSize){
            const batch = pairs.slice(i, i + batchSize);
            const results = await Promise.all(batch.map(({ chain, pairAddress })=>getTokenInfoFromPair(chain, pairAddress)));
            for (const tokenInfo of results){
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
                await new Promise((resolve)=>setTimeout(resolve, 100));
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            timestamp: new Date().toISOString(),
            total: tokens.length,
            tokens
        });
    } catch (error) {
        console.error('Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch trending tokens'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5a663eaf._.js.map