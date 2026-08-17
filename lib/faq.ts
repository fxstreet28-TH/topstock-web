/**
 * FAQ structure, shared by the client accordion and the server-rendered
 * FAQPage structured data.
 *
 * This lives outside the 'use client' component on purpose: exports from a
 * client module become client references when imported by a server component,
 * so the array would not be iterable during prerender.
 */
export const FAQ_GROUPS = [
  {
    key: 'product',
    items: ['what', 'symbols', 'difference', 'version', 'gold', 'sourceCode', 'updates'],
  },
  {
    key: 'buying',
    items: ['howToBuy', 'price', 'payment', 'included', 'refund', 'priceCompare', 'invoice'],
  },
  {
    key: 'account',
    items: ['brokers', 'minimum', 'centVsStandard', 'leverage', 'symbolName', 'multipleAccounts'],
  },
  {
    key: 'running',
    items: ['vps', 'timeframe', 'settings', 'monitoring', 'multipleCharts', 'news'],
  },
  {
    key: 'risk',
    items: ['drawdown', 'martingale', 'worstCase', 'capitalAdvice', 'guarantee'],
  },
  {
    key: 'support',
    items: ['channels', 'hours', 'language', 'activationHelp'],
  },
] as const;
