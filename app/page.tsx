'use client';

import { useState } from 'react';

interface Token {
  chain: string;
  contract_address: string;
  token_name: string;
  token_symbol: string;
  price_usd: string | null;
  market_cap: number | null;
  liquidity_usd: number | null;
  age: string | null;
  dexscreener_url: string;
  priceChange?: {
    h1?: number;
    h24?: number;
  };
}

function formatMarketCap(mcap: number | null): string {
  if (mcap === null || mcap === undefined) return 'N/A';
  if (mcap >= 1_000_000_000) return `$${(mcap / 1_000_000_000).toFixed(1)}B`;
  if (mcap >= 1_000_000) return `$${(mcap / 1_000_000).toFixed(1)}M`;
  if (mcap >= 1_000) return `$${(mcap / 1_000).toFixed(1)}K`;
  return `$${mcap.toFixed(0)}`;
}

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [chainFilter, setChainFilter] = useState<string[]>([]);
  const [minMarketCap, setMinMarketCap] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [minLiquidity, setMinLiquidity] = useState<string>('');
  const [selectedTokens, setSelectedTokens] = useState<Set<number>>(new Set());

  // Helper function to parse age string to hours
  const parseAgeToHours = (age: string | null): number | null => {
    if (!age) return null;
    // Match patterns like: 5m, 2h, 1d, 3mo, 1y
    // Important: Order matters! Match "mo" before "m"
    const match = age.match(/(\d+)(mo|m|h|d|y)/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    if (unit === 'm') return value / 60; // minutes to hours
    if (unit === 'h') return value; // hours
    if (unit === 'd') return value * 24; // days to hours
    if (unit === 'mo') return value * 24 * 30; // months to hours (approximate)
    if (unit === 'y') return value * 24 * 365; // years to hours (approximate)
    return null;
  };

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    setSelectedTokens(new Set()); // Clear selections on new fetch

    try {
      // If multiple chains selected, fetch all and filter client-side
      // If single chain, pass to API for efficiency
      const params = new URLSearchParams();
      if (chainFilter.length === 1) {
        params.set('chain', chainFilter[0]);
      }

      const response = await fetch(`/api/trending?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();

      // Apply client-side filters
      let filteredTokens = data.tokens;

      // Filter by multiple chains
      if (chainFilter.length > 1) {
        filteredTokens = filteredTokens.filter((token: Token) =>
          chainFilter.includes(token.chain)
        );
      }

      // Filter by minimum market cap
      if (minMarketCap) {
        const minMcap = parseInt(minMarketCap);
        filteredTokens = filteredTokens.filter((token: Token) =>
          token.market_cap !== null && token.market_cap >= minMcap
        );
      }

      // Filter by minimum liquidity
      if (minLiquidity) {
        const minLiq = parseInt(minLiquidity);
        filteredTokens = filteredTokens.filter((token: Token) =>
          token.liquidity_usd !== null && token.liquidity_usd >= minLiq
        );
      }

      // Filter by maximum age
      if (maxAge) {
        const maxAgeHours = parseInt(maxAge);
        filteredTokens = filteredTokens.filter((token: Token) => {
          const ageInHours = parseAgeToHours(token.age);
          return ageInHours !== null && ageInHours <= maxAgeHours;
        });
      }

      setTokens(filteredTokens);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async (address: string, index: number) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAllAddresses = async () => {
    const addresses = tokens.map(t => t.contract_address).join('\n');
    try {
      await navigator.clipboard.writeText(addresses);
      alert('All addresses copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copySelectedAddresses = async () => {
    const selectedAddresses = tokens
      .filter((_, index) => selectedTokens.has(index))
      .map(t => t.contract_address)
      .join('\n');
    try {
      await navigator.clipboard.writeText(selectedAddresses);
      alert(`${selectedTokens.size} selected addresses copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleTokenSelection = (index: number) => {
    const newSelected = new Set(selectedTokens);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTokens(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTokens.size === tokens.length) {
      setSelectedTokens(new Set());
    } else {
      setSelectedTokens(new Set(tokens.map((_, i) => i)));
    }
  };

  const clearFilters = () => {
    setChainFilter([]);
    setMinMarketCap('');
    setMaxAge('');
    setMinLiquidity('');
  };

  const toggleChainFilter = (chain: string) => {
    if (chainFilter.includes(chain)) {
      setChainFilter(chainFilter.filter(c => c !== chain));
    } else {
      setChainFilter([...chainFilter, chain]);
    }
  };

  const exportCSV = () => {
    const headers = ['Rank', 'Chain', 'Symbol', 'Name', 'Contract Address', 'Age', 'Market Cap', 'Price USD'];
    const rows = tokens.map((t, i) => [
      i + 1,
      t.chain,
      t.token_symbol,
      t.token_name,
      t.contract_address,
      t.age || 'N/A',
      t.market_cap || 'N/A',
      t.price_usd || 'N/A',
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trending_tokens_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            DexScreener Trending Tokens
          </h1>
          <p className="text-gray-400">
            Extract token contract addresses from trending pairs
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {/* Chain Multi-Select */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-300 text-center">Chains (multi-select):</label>
            <div className="flex flex-wrap gap-2 justify-center">
              {['solana', 'ethereum', 'bsc', 'base', 'polygon', 'arbitrum', 'avalanche'].map(chain => (
                <button
                  key={chain}
                  onClick={() => toggleChainFilter(chain)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
                    chainFilter.includes(chain)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {chain}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
            <select
              value={minMarketCap}
              onChange={(e) => setMinMarketCap(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Min Market Cap</option>
              <option value="500000">&gt; $500K</option>
              <option value="1000000">&gt; $1M</option>
            </select>

            <select
              value={minLiquidity}
              onChange={(e) => setMinLiquidity(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Min Liquidity</option>
              <option value="50000">&gt; $50K</option>
              <option value="100000">&gt; $100K</option>
              <option value="250000">&gt; $250K</option>
            </select>

            <select
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Max Age</option>
              <option value="24">&lt; 1 Day</option>
              <option value="168">&lt; 7 Days</option>
            </select>

            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              🔄 Clear Filters
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <button
              onClick={fetchTokens}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Fetching...
                </span>
              ) : (
                '🔍 Fetch Trending Tokens'
              )}
            </button>

            {tokens.length > 0 && (
              <>
                {selectedTokens.size > 0 && (
                  <button
                    onClick={copySelectedAddresses}
                    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    📋 Copy Selected ({selectedTokens.size})
                  </button>
                )}
                <button
                  onClick={copyAllAddresses}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📋 Copy All Addresses
                </button>
                <button
                  onClick={exportCSV}
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📥 Export CSV
                </button>
              </>
            )}
          </div>

          {lastUpdated && (
            <div className="text-center text-gray-400 mt-4 text-sm space-y-1">
              <p>Last updated: {lastUpdated}</p>
              {tokens.length > 0 && (
                <p className="font-semibold text-green-400">
                  Showing {tokens.length} token{tokens.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-400">Fetching trending tokens from DexScreener...</p>
            <p className="text-sm text-gray-500">This may take 20-30 seconds</p>
          </div>
        )}

        {/* Results Table */}
        {!loading && tokens.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTokens.size === tokens.length && tokens.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Chain</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Token</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">MCap</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Liq</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contract Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {tokens.map((token, index) => (
                    <tr key={index} className={`hover:bg-gray-700/50 transition-colors ${selectedTokens.has(index) ? 'bg-blue-900/30' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedTokens.has(index)}
                          onChange={() => toggleTokenSelection(index)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-700 rounded text-sm capitalize">
                          {token.chain}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-semibold">{token.token_symbol}</span>
                          <span className="text-gray-400 text-sm ml-2 hidden md:inline">
                            {token.token_name.length > 20 
                              ? token.token_name.substring(0, 20) + '...' 
                              : token.token_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {token.age || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-green-400 font-mono">
                        {formatMarketCap(token.market_cap)}
                      </td>
                      <td className="px-4 py-3 text-blue-400 font-mono">
                        {formatMarketCap(token.liquidity_usd)}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-900 px-2 py-1 rounded font-mono text-blue-300">
                          {token.contract_address.length > 20 
                            ? `${token.contract_address.substring(0, 8)}...${token.contract_address.slice(-8)}`
                            : token.contract_address}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyAddress(token.contract_address, index)}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              copiedIndex === index
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                          >
                            {copiedIndex === index ? '✓ Copied' : 'Copy'}
                          </button>
                          <a
                            href={token.dexscreener_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                          >
                            View
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && tokens.length === 0 && !error && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl">Click the button above to fetch trending tokens</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Top 50 trending tokens from DexScreener • Shows actual token contract addresses (not pair addresses)</p>
        </footer>
      </div>
    </main>
  );
}
