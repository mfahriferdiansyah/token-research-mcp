/**
 * Monad MCP Tutorial
 * 
 * This file demonstrates how to create a Model Context Protocol (MCP) server
 * that interacts with the Monad blockchain testnet to check MON balances.
 */

// Import necessary dependencies
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createPublicClient, formatUnits, http } from "viem";
import { monadTestnet } from "viem/chains";

// Helper function to format large numbers
function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  } else {
    return num.toFixed(2);
  }
}

// Create a public client to interact with the Monad testnet
const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
});

// Initialize the MCP server with a name, version, and capabilities
// Create a new MCP server instance
const server = new McpServer({
    name: "token-research-mcp",
    version: "0.0.1",
    // Array of supported tool names that clients can call
    capabilities: [
        "get-mon-balance",
        "analyze-portfolio",
        "scan-trending-tokens",
        "token-research-report",
        "market-analysis"
    ]
});


// Define a tool that gets the MON balance for a given address
server.tool(
    // Tool ID 
    "get-mon-balance",
    // Description of what the tool does
    "Get MON balance for an address on Monad testnet",
    // Input schema
    {
        address: z.string().describe("Monad testnet address to check balance for"),
    },
    // Tool implementation
    async ({ address }) => {
        try {
            // Check MON balance for the input address
            const balance = await publicClient.getBalance({
                address: address as `0x${string}`,
            });

            // Return a human friendly message indicating the balance.
            return {
                content: [
                    {
                        type: "text",
                        text: `Balance for ${address}: ${formatUnits(balance, 18)} MON`,
                    },
                ],
            };
        } catch (error) {
            // If the balance check process fails, return a graceful message back to the MCP client indicating a failure.
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to retrieve balance for address: ${address}. Error: ${
                        error instanceof Error ? error.message : String(error)
                        }`,
                    },
                ],
            };
        }
    }
);

// Define a tool that analyzes portfolio
server.tool(
  "analyze-portfolio",
  "Analyze wallet portfolio including balances, token info, and price trends",
  {
    walletAddress: z.string().describe("Wallet address to analyze"),
  },
  async ({ walletAddress }) => {
    try {
      // 1. Get wallet positions from Nad.fun with required pagination parameters
      const positions = await fetch(
        `https://testnet-bot-api-server.nad.fun/account/position/${walletAddress}?page=1&limit=100&position_type=all`
      ).then(res => res.json());

      // 2. Get token information for each position
      const portfolioAnalysis = await Promise.all(
        positions.positions.map(async (position: any) => {
          const token = position.token;
          
          // Get current price from market info
          const marketInfo = await fetch(
            `https://testnet-bot-api-server.nad.fun/token/market/${token.token_address}`
          ).then(res => res.json());

          // Get chart data with required parameters
          const currentTime = Math.floor(Date.now() / 1000);
          const chartData = await fetch(
            `https://testnet-bot-api-server.nad.fun/token/chart/${token.token_address}?interval=1d&base_timestamp=${currentTime}`
          ).then(res => res.json());

          // Calculate trend from chart data
          const first = parseFloat(chartData.data[0]?.close_price || "0");
          const last = parseFloat(chartData.data[chartData.data.length - 1]?.close_price || "0");
          const trend = last > first ? "📈" : last < first ? "📉" : "➖";
          const change = ((last - first) / first * 100).toFixed(2);

          // Calculate PnL from position info
          const totalPnl = parseFloat(position.position.total_pnl);
          const unrealizedPnl = parseFloat(position.position.unrealized_pnl);
          const realizedPnl = parseFloat(position.position.realized_pnl);

          return {
            symbol: token.symbol,
            name: token.name,
            balance: position.position.current_token_amount,
            price: marketInfo.price,
            value: (parseFloat(position.position.current_token_amount) * parseFloat(marketInfo.price)).toFixed(2),
            trend: trend,
            change: change + "%",
            totalPnl: totalPnl.toFixed(2),
            unrealizedPnl: unrealizedPnl.toFixed(2),
            realizedPnl: realizedPnl.toFixed(2)
          };
        })
      );

      // Sort by value (highest first)
      portfolioAnalysis.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

      // Create markdown table
      const table = [
        "| Token | Name | Balance | Price | Value | Trend | Change | PnL |",
        "|-------|------|---------|-------|-------|-------|--------|-----|",
        ...portfolioAnalysis.map(p => 
          `| ${p.symbol} | ${p.name} | ${p.balance} | ${p.price} | ${p.value} | ${p.trend} | ${p.change} | ${p.totalPnl} |`
        )
      ].join("\n");

      // Calculate total portfolio value and PnL
      const totalValue = portfolioAnalysis.reduce((sum, p) => sum + parseFloat(p.value), 0).toFixed(2);
      const totalPnl = portfolioAnalysis.reduce((sum, p) => sum + parseFloat(p.totalPnl), 0).toFixed(2);

      return {
        content: [
          {
            type: "text",
            text: `# Portfolio Analysis for ${walletAddress}\n\n` +
                  `Total Portfolio Value: ${totalValue}\n` +
                  `Total PnL: ${totalPnl}\n\n` +
                  `${table}\n\n` +
                  `## Portfolio Insights\n` +
                  `- Top holding: ${portfolioAnalysis[0]?.symbol} (${((parseFloat(portfolioAnalysis[0]?.value) / parseFloat(totalValue)) * 100).toFixed(2)}%)\n` +
                  `- Number of tokens: ${portfolioAnalysis.length}\n` +
                  `- Best performer: ${portfolioAnalysis.sort((a, b) => parseFloat(b.change) - parseFloat(a.change))[0]?.symbol} (${portfolioAnalysis.sort((a, b) => parseFloat(b.change) - parseFloat(a.change))[0]?.change})\n` +
                  `- Worst performer: ${portfolioAnalysis.sort((a, b) => parseFloat(a.change) - parseFloat(b.change))[0]?.symbol} (${portfolioAnalysis.sort((a, b) => parseFloat(a.change) - parseFloat(b.change))[0]?.change})\n` +
                  `- Best PnL: ${portfolioAnalysis.sort((a, b) => parseFloat(b.totalPnl) - parseFloat(a.totalPnl))[0]?.symbol} (${portfolioAnalysis.sort((a, b) => parseFloat(b.totalPnl) - parseFloat(a.totalPnl))[0]?.totalPnl})`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to analyze portfolio. Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Define a tool that scans for new and trending tokens
server.tool(
  "scan-trending-tokens",
  "Scan for new, trending, and top tokens by combining creation time, latest trade, and market cap data",
  {
    page: z.number().optional().describe("Page number for pagination (optional)"),
    limit: z.number().optional().describe("Number of items per page (optional)")
  },
  async ({ page = 1, limit = 10 }) => {
    try {
      // Fetch tokens ordered by creation time
      const creationTimeResponse = await fetch(
        `https://testnet-bot-api-server.nad.fun/order/creation_time?page=${page}&limit=${limit}`
      ).then(res => res.json());

      // Fetch tokens ordered by latest trade
      const latestTradeResponse = await fetch(
        `https://testnet-bot-api-server.nad.fun/order/latest_trade?page=${page}&limit=${limit}`
      ).then(res => res.json());

      // Fetch tokens ordered by market cap
      const marketCapResponse = await fetch(
        `https://testnet-bot-api-server.nad.fun/order/market_cap?page=${page}&limit=${limit}`
      ).then(res => res.json());

      // Combine the results into a unified view
      const newTokens = creationTimeResponse.order_token || [];
      const trendingTokens = latestTradeResponse.order_token || [];
      const topTokens = marketCapResponse.order_token || [];

      // Create a markdown table for each category
      const newTokensTable = [
        "| Token | Name | Market Cap | FDV | Price | Research |",
        "|-------|------|------------|-----|-------|----------|",
        ...newTokens.map((token: { token_info: { symbol: string; name: string; token_address: string; total_supply: string; circulating_supply: string }; market_info: { price: string } }) => {
          const priceInMon = parseFloat(token.market_info.price);
          const circulatingSupply = parseFloat(token.token_info.circulating_supply || token.token_info.total_supply);
          const totalSupply = parseFloat(token.token_info.total_supply);
          // Divide by 1e9 to convert from T to K range
          const marketCap = (priceInMon * circulatingSupply) / 1e9;
          const fdv = (priceInMon * totalSupply) / 1e9;
          return `| ${token.token_info.symbol} | ${token.token_info.name} | ${formatNumber(marketCap)} MON | ${formatNumber(fdv)} MON | ${priceInMon} MON | [Research](token-research-report?tokenAddress=${token.token_info.token_address}) |`;
        })
      ].join("\n");

      const trendingTokensTable = [
        "| Token | Name | Total Supply | Creator | Price | Research |",
        "|-------|------|--------------|---------|-------|----------|",
        ...trendingTokens.map((token: { token_info: { symbol: string; name: string; token_address: string; total_supply: string; creator: string }; market_info: { price: string } }) => {
          const priceInMon = parseFloat(token.market_info.price);
          const totalSupply = parseFloat(token.token_info.total_supply);
          return `| ${token.token_info.symbol} | ${token.token_info.name} | ${formatNumber(totalSupply)} | ${token.token_info.creator} | ${priceInMon} MON | [Research](token-research-report?tokenAddress=${token.token_info.token_address}) |`;
        })
      ].join("\n");

      const topTokensTable = [
        "| Token | Name | Market Cap | FDV | Price | Research |",
        "|-------|------|------------|-----|-------|----------|",
        ...topTokens.map((token: { token_info: { symbol: string; name: string; token_address: string; total_supply: string; circulating_supply: string }; market_info: { price: string } }) => {
          const priceInMon = parseFloat(token.market_info.price);
          const circulatingSupply = parseFloat(token.token_info.circulating_supply || token.token_info.total_supply);
          const totalSupply = parseFloat(token.token_info.total_supply);
          // Divide by 1e9 to convert from T to K range
          const marketCap = (priceInMon * circulatingSupply) / 1e9;
          const fdv = (priceInMon * totalSupply) / 1e9;
          return `| ${token.token_info.symbol} | ${token.token_info.name} | ${formatNumber(marketCap)} MON | ${formatNumber(fdv)} MON | ${priceInMon} MON | [Research](token-research-report?tokenAddress=${token.token_info.token_address}) |`;
        })
      ].join("\n");

      return {
        content: [
          {
            type: "text",
            text: `# New & Trending Tokens Scanner\n\n` +
                  `*Note: Market Cap is calculated using circulating supply, while FDV (Fully Diluted Value) uses total supply*\n\n` +
                  `## New Tokens\n${newTokensTable}\n\n` +
                  `## Trending Tokens\n${trendingTokensTable}\n\n` +
                  `## Top Tokens by Market Cap\n${topTokensTable}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to scan trending tokens. Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Define a tool that provides a comprehensive research report for a token
server.tool(
  "token-research-report",
  "Generate a comprehensive research report for a token, including metadata, market info, chart data, holders, and swap history",
  {
    tokenAddress: z.string().describe("Token address to research"),
    page: z.number().optional().describe("Page number for pagination (optional)"),
    limit: z.number().optional().describe("Number of items per page (optional)")
  },
  async ({ tokenAddress, page = 1, limit = 10 }) => {
    try {
      // Fetch token metadata
      const tokenMetadata = await fetch(
        `https://testnet-bot-api-server.nad.fun/token/${tokenAddress}`
      ).then(res => res.json());

      // Fetch market info
      const marketInfo = await fetch(
        `https://testnet-bot-api-server.nad.fun/token/market/${tokenAddress}`
      ).then(res => res.json());

      // Fetch chart data
      const currentTime = Math.floor(Date.now() / 1000);
      const chartData = await fetch(
        `https://testnet-bot-api-server.nad.fun/token/chart/${tokenAddress}?interval=1d&base_timestamp=${currentTime}`
      ).then(res => res.json());

      // Fetch token holders
      const holdersData = await fetch(
        `https://testnet-bot-api-server.nad.fun/token/holder/${tokenAddress}?page=${page}&limit=${limit}`
      ).then(res => res.json());

      // Fetch swap history
      const swapHistory = await fetch(
        `https://testnet-bot-api-server.nad.fun/token/swap/${tokenAddress}?page=${page}&limit=${limit}`
      ).then(res => res.json());

      // Create a markdown table for token metadata
      const metadataTable = [
        "| Property | Value |",
        "|----------|-------|",
        `| Name | ${tokenMetadata.name} |`,
        `| Symbol | ${tokenMetadata.symbol} |`,
        `| Creator | ${tokenMetadata.creator_address} |`,
        `| Total Supply | ${tokenMetadata.total_supply} |`,
        `| Created At | ${new Date(tokenMetadata.created_at * 1000).toISOString()} |`,
        `| Description | ${tokenMetadata.description || 'N/A'} |`,
        `| Telegram | ${tokenMetadata.telegram || 'N/A'} |`,
        `| Twitter | ${tokenMetadata.twitter || 'N/A'} |`,
        `| Website | ${tokenMetadata.website || 'N/A'} |`
      ].join("\n");

      // Create a markdown table for market info
      const marketTable = [
        "| Property | Value |",
        "|----------|-------|",
        `| Price | ${formatNumber(parseFloat(marketInfo.price))} MON |`,
        `| Market Cap | ${formatNumber(parseFloat(marketInfo.price) * parseFloat(tokenMetadata.total_supply))} MON |`,
        `| Market Type | ${marketInfo.market_type} |`,
        `| Reserve Token | ${marketInfo.reserve_token} |`,
        `| Reserve Native | ${marketInfo.reserve_native} |`,
        `| Virtual Token | ${marketInfo.virtual_token} |`,
        `| Virtual Native | ${marketInfo.virtual_native} |`,
        `| Latest Trade At | ${new Date(marketInfo.latest_trade_at * 1000).toISOString()} |`
      ].join("\n");

      // Create a markdown table for top holders
      const holdersTable = [
        "| Address | Balance | Is Dev |",
        "|---------|---------|--------|",
        ...holdersData.holders.map((holder: { account_address: string; balance: string; is_dev: boolean }) => 
          `| ${holder.account_address} | ${holder.balance} | ${holder.is_dev ? 'Yes' : 'No'} |`
        )
      ].join("\n");

      // Create a markdown table for recent swaps
      const swapsTable = [
        "| Time | Type | MON Amount | Token Amount |",
        "|------|------|------------|--------------|",
        ...swapHistory.swaps.map((swap: { created_at: number; is_buy: boolean; mon_amount: string; token_amount: string }) => 
          `| ${new Date(swap.created_at * 1000).toISOString()} | ${swap.is_buy ? 'Buy' : 'Sell'} | ${swap.mon_amount} | ${swap.token_amount} |`
        )
      ].join("\n");

      // Calculate price trend from chart data
      const firstPrice = parseFloat(chartData.data[0]?.close_price || "0");
      const lastPrice = parseFloat(chartData.data[chartData.data.length - 1]?.close_price || "0");
      const priceChange = ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2);
      const trend = lastPrice > firstPrice ? "📈" : lastPrice < firstPrice ? "📉" : "➖";

      // Identify whales (large holders)
      const whales = holdersData.holders.filter((holder: { balance: string }) => parseFloat(holder.balance) > 1000); // Example threshold

      // Create a markdown table for whales
      const whalesTable = [
        "| Address | Balance | Is Dev |",
        "|---------|---------|--------|",
        ...whales.map((whale: { account_address: string; balance: string; is_dev: boolean }) => 
          `| ${whale.account_address} | ${whale.balance} | ${whale.is_dev ? 'Yes' : 'No'} |`
        )
      ].join("\n");

      // Calculate bullish or bearish percentage based on price change
      const bullishPercentage = parseFloat(priceChange) > 0 ? parseFloat(priceChange) : 0;
      const bearishPercentage = parseFloat(priceChange) < 0 ? Math.abs(parseFloat(priceChange)) : 0;

      // Determine risk level based on whales and price trend
      const riskLevel = whales.length > 5 ? "High" : whales.length > 2 ? "Medium" : "Low";

      // Generate suggestions
      const suggestions = [
        `- **Bullish**: ${bullishPercentage}%`,
        `- **Bearish**: ${bearishPercentage}%`,
        `- **Risk Level**: ${riskLevel}`,
        `- **Warning**: ${whales.length > 5 ? "High concentration of whales may indicate risk." : "No significant whale concentration."}`,
        `- **Plus**: ${parseFloat(priceChange) > 0 ? "Price is trending upward." : "Price is stable or trending downward."}`,
        `- **Minus**: ${parseFloat(priceChange) < 0 ? "Price is trending downward." : "Price is stable or trending upward."}`
      ].join("\n");

      return {
        content: [
          {
            type: "text",
            text: `# Token Research Report: ${tokenMetadata.name} (${tokenMetadata.symbol})\n\n` +
                  `## Token Metadata\n${metadataTable}\n\n` +
                  `## Market Information\n${marketTable}\n\n` +
                  `## Price Trend\n` +
                  `- Current Price: ${lastPrice}\n` +
                  `- Price Change: ${priceChange}% ${trend}\n\n` +
                  `## Top Holders\n${holdersTable}\n\n` +
                  `## Whales (Large Holders)\n${whalesTable}\n\n` +
                  `## Recent Swaps\n${swapsTable}\n\n` +
                  `## Suggestions\n${suggestions}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to generate token research report. Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Define a tool that provides comprehensive market analysis for a token
server.tool(
  "market-analysis",
  "Generate comprehensive market analysis including technical indicators, market health, liquidity, whale concentration, and trading patterns",
  {
    tokenAddress: z.string().describe("Token address to analyze"),
    interval: z.string().optional().describe("Chart interval (1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w)"),
    baseTimestamp: z.number().optional().describe("Base timestamp for chart data")
  },
  async ({ tokenAddress, interval = "1d", baseTimestamp = Math.floor(Date.now() / 1000) }) => {
    try {
      // Fetch chart data
      const chartData = await fetch(
        `https://testnet-bot-api-server.nad.fun/token/chart/${tokenAddress}?interval=${interval}&base_timestamp=${baseTimestamp}`
      ).then(res => res.json());

      // Fetch market info for health indicators
      const marketInfo = await fetch(
        `https://testnet-bot-api-server.nad.fun/token/market/${tokenAddress}`
      ).then(res => res.json());

      // Fetch token holders for concentration analysis
      const holdersData = await fetch(
        `https://testnet-bot-api-server.nad.fun/token/holder/${tokenAddress}?page=1&limit=100`
      ).then(res => res.json());

      // Calculate technical indicators
      const prices = chartData.data.map((d: { close_price: string }) => parseFloat(d.close_price));
      const volumes = chartData.data.map((d: { volume: string }) => parseFloat(d.volume));
      const timestamps = chartData.data.map((d: { time_stamp: number }) => d.time_stamp);

      // Calculate Moving Averages (MA)
      const shortMA = calculateMA(prices, 10);
      const longMA = calculateMA(prices, 30);

      // Calculate RSI
      const rsi = calculateRSI(prices, 14);

      // Calculate Bollinger Bands
      const { upperBand, lowerBand, middleBand } = calculateBollingerBands(prices, 20, 2);

      // Calculate MACD
      const { macd, signal, histogram } = calculateMACD(prices, 12, 26, 9);

      // Calculate Volume MA for volume trend
      const volumeMA = calculateMA(volumes, 20);

      // Market Health Indicators
      const liquidityScore = calculateLiquidityScore(marketInfo);
      const whaleConcentration = calculateWhaleConcentration(holdersData.holders);
      const marketDepth = calculateMarketDepth(marketInfo);
      const volatility = calculateVolatility(prices);
      const volumeTrend = determineVolumeTrend(volumes, volumeMA);

      // Create markdown tables for technical indicators
      const maTable = [
        "| Time | Price | Short MA | Long MA |",
        "|------|-------|----------|---------|",
        ...timestamps.map((timestamp: number, i: number) => 
          `| ${new Date(timestamp * 1000).toISOString()} | ${prices[i]} | ${shortMA[i]} | ${longMA[i]} |`
        )
      ].join("\n");

      const rsiTable = [
        "| Time | RSI |",
        "|------|-----|",
        ...timestamps.map((timestamp: number, i: number) => 
          `| ${new Date(timestamp * 1000).toISOString()} | ${rsi[i]} |`
        )
      ].join("\n");

      const bbTable = [
        "| Time | Upper Band | Middle Band | Lower Band |",
        "|------|------------|-------------|------------|",
        ...timestamps.map((timestamp: number, i: number) => 
          `| ${new Date(timestamp * 1000).toISOString()} | ${upperBand[i]} | ${middleBand[i]} | ${lowerBand[i]} |`
        )
      ].join("\n");

      const macdTable = [
        "| Time | MACD | Signal | Histogram |",
        "|------|------|--------|-----------|",
        ...timestamps.map((timestamp: number, i: number) => 
          `| ${new Date(timestamp * 1000).toISOString()} | ${macd[i]} | ${signal[i]} | ${histogram[i]} |`
        )
      ].join("\n");

      // Market Health Analysis
      const healthAnalysis = [
        "## Market Health Analysis",
        "### Liquidity Score",
        `- Score: ${liquidityScore.score}/10`,
        `- Status: ${liquidityScore.status}`,
        `- Details: ${liquidityScore.details}`,
        "",
        "### Whale Concentration",
        `- Concentration: ${whaleConcentration.concentration}%`,
        `- Number of Whales: ${whaleConcentration.count}`,
        `- Risk Level: ${whaleConcentration.riskLevel}`,
        "",
        "### Market Depth",
        `- Depth Score: ${marketDepth.score}/10`,
        `- Buy/Sell Ratio: ${marketDepth.buySellRatio}`,
        `- Status: ${marketDepth.status}`,
        "",
        "### Volatility Analysis",
        `- Current Volatility: ${volatility.current}%`,
        `- Average Volatility: ${volatility.average}%`,
        `- Trend: ${volatility.trend}`,
        "",
        "### Volume Analysis",
        `- Current Volume: ${formatNumber(volumes[volumes.length - 1])}`,
        `- Volume Trend: ${volumeTrend}`,
        `- Volume MA: ${formatNumber(volumeMA[volumeMA.length - 1])}`
      ].join("\n");

      // Generate analysis
      const trend = determineTrend(prices, shortMA, longMA);
      const supportResistance = identifySupportResistance(prices);
      const signals = generateSignals(prices, rsi, macd, signal);

      return {
        content: [
          {
            type: "text",
            text: `# Comprehensive Market Analysis for Token ${tokenAddress}\n\n` +
                  `## Price Chart\n` +
                  `- Current Price: ${prices[prices.length - 1]}\n` +
                  `- Trend: ${trend}\n\n` +
                  `## Technical Indicators\n` +
                  `### Moving Averages\n${maTable}\n\n` +
                  `### RSI\n${rsiTable}\n\n` +
                  `### Bollinger Bands\n${bbTable}\n\n` +
                  `### MACD\n${macdTable}\n\n` +
                  healthAnalysis + "\n\n" +
                  `## Analysis\n` +
                  `- Support Levels: ${supportResistance.support.join(", ")}\n` +
                  `- Resistance Levels: ${supportResistance.resistance.join(", ")}\n` +
                  `- Buy/Sell Signals: ${signals.join(", ")}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to generate comprehensive market analysis. Error: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Helper functions for technical indicators
function calculateMA(prices: number[], period: number): number[] {
  const ma: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ma.push(NaN);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      ma.push(sum / period);
    }
  }
  return ma;
}

function calculateRSI(prices: number[], period: number): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(NaN);
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  return rsi;
}

function calculateBollingerBands(prices: number[], period: number, stdDev: number): { upperBand: number[]; middleBand: number[]; lowerBand: number[] } {
  const middleBand = calculateMA(prices, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upperBand.push(NaN);
      lowerBand.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const avg = middleBand[i];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      upperBand.push(avg + (standardDeviation * stdDev));
      lowerBand.push(avg - (standardDeviation * stdDev));
    }
  }
  return { upperBand, middleBand, lowerBand };
}

function calculateMACD(prices: number[], shortPeriod: number, longPeriod: number, signalPeriod: number): { macd: number[]; signal: number[]; histogram: number[] } {
  const shortEMA = calculateEMA(prices, shortPeriod);
  const longEMA = calculateEMA(prices, longPeriod);
  const macd: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    macd.push(shortEMA[i] - longEMA[i]);
  }
  const signal = calculateEMA(macd, signalPeriod);
  const histogram: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    histogram.push(macd[i] - signal[i]);
  }
  return { macd, signal, histogram };
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  ema.push(prices[0]);
  for (let i = 1; i < prices.length; i++) {
    ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]);
  }
  return ema;
}

function determineTrend(prices: number[], shortMA: number[], longMA: number[]): string {
  const lastPrice = prices[prices.length - 1];
  const lastShortMA = shortMA[shortMA.length - 1];
  const lastLongMA = longMA[longMA.length - 1];
  if (lastPrice > lastShortMA && lastShortMA > lastLongMA) return "Upward";
  if (lastPrice < lastShortMA && lastShortMA < lastLongMA) return "Downward";
  return "Sideways";
}

function identifySupportResistance(prices: number[]): { support: number[]; resistance: number[] } {
  const support: number[] = [];
  const resistance: number[] = [];
  for (let i = 1; i < prices.length - 1; i++) {
    if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) support.push(prices[i]);
    if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) resistance.push(prices[i]);
  }
  return { support, resistance };
}

function generateSignals(prices: number[], rsi: number[], macd: number[], signal: number[]): string[] {
  const signals: string[] = [];
  const lastPrice = prices[prices.length - 1];
  const lastRSI = rsi[rsi.length - 1];
  const lastMACD = macd[macd.length - 1];
  const lastSignal = signal[signal.length - 1];

  if (lastRSI < 30) signals.push("Oversold (RSI < 30)");
  if (lastRSI > 70) signals.push("Overbought (RSI > 70)");
  if (lastMACD > lastSignal) signals.push("MACD Bullish Crossover");
  if (lastMACD < lastSignal) signals.push("MACD Bearish Crossover");

  return signals;
}

// Helper functions for market health indicators
function calculateLiquidityScore(marketInfo: any): { score: number; status: string; details: string } {
  const reserveToken = parseFloat(marketInfo.reserve_token);
  const reserveNative = parseFloat(marketInfo.reserve_native);
  const totalReserves = reserveToken + reserveNative;
  
  // Simple scoring based on reserves
  let score = Math.min(10, Math.log10(totalReserves));
  let status = "Low";
  let details = "Limited liquidity";
  
  if (score > 8) {
    status = "Excellent";
    details = "High liquidity with deep reserves";
  } else if (score > 6) {
    status = "Good";
    details = "Adequate liquidity";
  } else if (score > 4) {
    status = "Moderate";
    details = "Moderate liquidity";
  }
  
  return { score, status, details };
}

function calculateWhaleConcentration(holders: any[]): { concentration: number; count: number; riskLevel: string } {
  const totalSupply = holders.reduce((sum, h) => sum + parseFloat(h.balance), 0);
  const whales = holders.filter(h => parseFloat(h.balance) > totalSupply * 0.01); // 1% threshold
  const whaleHoldings = whales.reduce((sum, w) => sum + parseFloat(w.balance), 0);
  const concentration = (whaleHoldings / totalSupply) * 100;
  
  let riskLevel = "Low";
  if (concentration > 50) riskLevel = "Critical";
  else if (concentration > 30) riskLevel = "High";
  else if (concentration > 15) riskLevel = "Moderate";
  
  return { concentration, count: whales.length, riskLevel };
}

function calculateMarketDepth(marketInfo: any): { score: number; buySellRatio: number; status: string } {
  const reserveToken = parseFloat(marketInfo.reserve_token);
  const reserveNative = parseFloat(marketInfo.reserve_native);
  const buySellRatio = reserveToken / reserveNative;
  
  let score = Math.min(10, Math.log10(reserveToken + reserveNative));
  let status = "Shallow";
  
  if (score > 8) status = "Deep";
  else if (score > 6) status = "Moderate";
  else if (score > 4) status = "Limited";
  
  return { score, buySellRatio, status };
}

function calculateVolatility(prices: number[]): { current: number; average: number; trend: string } {
  const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
  const currentVolatility = Math.sqrt(returns.slice(-20).reduce((sum, r) => sum + r * r, 0) / 20) * 100;
  const averageVolatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * 100;
  
  let trend = "Stable";
  if (currentVolatility > averageVolatility * 1.5) trend = "Increasing";
  else if (currentVolatility < averageVolatility * 0.5) trend = "Decreasing";
  
  return { current: currentVolatility, average: averageVolatility, trend };
}

function determineVolumeTrend(volumes: number[], volumeMA: number[]): string {
  const currentVolume = volumes[volumes.length - 1];
  const currentMA = volumeMA[volumeMA.length - 1];
  
  if (currentVolume > currentMA * 1.5) return "Strong Upward";
  if (currentVolume > currentMA * 1.2) return "Upward";
  if (currentVolume < currentMA * 0.8) return "Downward";
  if (currentVolume < currentMA * 0.5) return "Strong Downward";
  return "Neutral";
}

// Example prompt:
// "Generate advanced charting and technical analysis for token 0xABC with interval 1d and base timestamp current time."

/**
 * Main function to start the MCP server
 * Uses stdio for communication with LLM clients
 */
async function main() {
    // Create a transport layer using standard input/output
    const transport = new StdioServerTransport();
    
    // Connect the server to the transport
    await server.connect(transport);
    
    console.error("Monad testnet MCP Server running on stdio");
}

// Start the server and handle any fatal errors
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
