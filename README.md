# Monad Testnet Token Research & Analysis Tool

## Table of Contents
- [Overview](#overview)
- [Usage Flows](#usage-flows)
  - [Discovering and Analyzing New Opportunities](#1-discovering-and-analyzing-new-opportunities)
  - [Portfolio Management](#2-portfolio-management)
  - [Risk Management](#3-risk-management)
- [Key Features](#key-features)
  - [Token Research](#token-research)
  - [Technical Analysis](#technical-analysis)
  - [Risk Management](#risk-management)
  - [Portfolio Tools](#portfolio-tools)
- [Installation](#installation)
- [Configuration](#configuration-for-claude-desktop)
- [Development](#development)

## Overview
A comprehensive token analysis tool that provides detailed research reports for tokens on the Monad testnet. This tool combines both fundamental and technical analysis to deliver comprehensive token insights.

## Usage Flows

### 1. Discovering and Analyzing New Opportunities
```
┌─────────────────────────────────────────────────────────┐
│                     Start                               │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Scan Trending Tokens                     │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Quick Research                          │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Deep Analysis                           │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Trading Decision                        │
└─────────────────────────────────────────────────────────┘
```

### 2. Portfolio Management
```
┌─────────────────────────────────────────────────────────┐
│                     Start                               │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Check MON Balance                       │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Analyze Portfolio                       │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Token Research                          │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Rebalancing Decision                    │
└─────────────────────────────────────────────────────────┘
```

### 3. Risk Management
```
┌─────────────────────────────────────────────────────────┐
│                     Start                               │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Market Overview                         │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Risk Assessment                         │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│                 Portfolio Protection                    │
└─────────────────────────────────────────────────────────┘
```

## Key Features

### Token Research
- Metadata Analysis
- Market Information
- Holder Analysis
- Risk Assessment

### Technical Analysis
- Moving Averages
- RSI
- Bollinger Bands
- MACD

### Risk Management
- Whale Analysis
- Liquidity Check
- Volatility Tracking

### Portfolio Tools
- Balance Tracking
- Performance Analysis
- PnL Monitoring

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
