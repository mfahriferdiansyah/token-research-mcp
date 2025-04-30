# Monad Testnet MCP

A comprehensive token analysis tool that provides detailed research reports for tokens on the Monad testnet. This tool combines both fundamental and technical analysis to deliver comprehensive token insights.

## Usage Flow & Scenarios

### Scenario 1: Discovering and Analyzing New Opportunities
1. **Initial Discovery**
   - Use `scan-trending-tokens` to find:
     - Newly listed tokens
     - Trending tokens by volume
     - Top tokens by market cap
   - This helps identify potential investment opportunities

2. **Quick Research**
   - For interesting tokens found, use `token-research-report`
   - Get immediate insights on:
     - Token fundamentals
     - Market statistics
     - Basic risk assessment
   - Helps filter out high-risk tokens quickly

3. **Deep Analysis**
   - For promising tokens, use `market-analysis`
   - Get comprehensive technical and market analysis:
     - Technical indicators
     - Market health
     - Whale concentration
     - Liquidity depth
   - Make informed trading decisions

### Scenario 2: Portfolio Management
1. **Balance Check**
   - Start with `get-mon-balance` to check your MON holdings
   - Understand your available capital

2. **Portfolio Analysis**
   - Use `analyze-portfolio` to:
     - View current holdings
     - Track performance
     - Monitor PnL
   - Identify underperforming assets

3. **Token Research**
   - For each holding, use `token-research-report`
   - Monitor:
     - Recent developments
     - Holder changes
     - Market sentiment
   - Make rebalancing decisions

### Scenario 3: Risk Management
1. **Market Overview**
   - Use `scan-trending-tokens` to:
     - Monitor market trends
     - Identify sector movements
     - Spot emerging patterns

2. **Risk Assessment**
   - For each position, use `market-analysis` to:
     - Check liquidity health
     - Monitor whale movements
     - Track volatility
   - Set appropriate stop-loss levels

3. **Portfolio Protection**
   - Use `analyze-portfolio` to:
     - Check portfolio concentration
     - Monitor correlation
     - Adjust position sizes
   - Maintain risk-balanced portfolio

## Usage Scenarios

### 1. Token Research & Analysis
**When to use**: When you need a comprehensive overview of a token
**Tool**: `token-research-report`
**What you get**:
- Token metadata and basic information
- Market statistics and price trends
- Holder distribution and whale analysis
- Recent trading activity
- Risk assessment and suggestions

### 2. Market Analysis & Technical Indicators
**When to use**: For in-depth market analysis and trading decisions
**Tool**: `market-analysis`
**What you get**:
- Technical indicators (MA, RSI, Bollinger Bands, MACD)
- Market health indicators
- Liquidity analysis
- Whale concentration metrics
- Volume and volatility analysis
- Support and resistance levels

### 3. Portfolio Tracking
**When to use**: To monitor and analyze your token holdings
**Tool**: `analyze-portfolio`
**What you get**:
- Portfolio value and composition
- Individual token performance
- Profit/loss tracking
- Portfolio diversification metrics

### 4. Token Discovery
**When to use**: To find new and trending tokens
**Tool**: `scan-trending-tokens`
**What you get**:
- Newly listed tokens
- Trending tokens by volume
- Top tokens by market cap
- Quick access to research reports

### 5. Balance Checking
**When to use**: To check MON token balances
**Tool**: `get-mon-balance`
**What you get**:
- Current MON token balance
- Balance history
- Transaction summary

## Features

- **Token Research Reports**
  - Detailed token metadata analysis
  - Market information and price tracking
  - Holder analysis and whale detection
  - Risk assessment and market sentiment
  - Recent swap history analysis

- **Technical Analysis**
  - Moving Averages (MA) calculation
  - Relative Strength Index (RSI) analysis
  - Bollinger Bands analysis
  - MACD (Moving Average Convergence Divergence)
  - Support and Resistance level identification
  - Price trend determination
  - Trading signal generation

- **Risk Assessment**
  - Whale concentration analysis
  - Price trend risk evaluation
  - Market sentiment indicators
  - Bullish/Bearish percentage calculation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/monad-testnet-mcp.git
cd monad-testnet-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration for Claude Desktop

To use this MCP with Claude Desktop, add the following configuration to your Claude settings:

```json
{
  "mcpServers": {
    "token-research-mcp": {
      "command": "node",
      "args": [
        "PATH_TO_YOUR_PROJECT/build/index.js"
      ]
    }
  }
}
```

Replace `PATH_TO_YOUR_PROJECT` with the absolute path to your project directory.

After adding the configuration:
1. Save the changes
2. Restart Claude Desktop for the changes to take effect

## Development

To contribute to the project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
