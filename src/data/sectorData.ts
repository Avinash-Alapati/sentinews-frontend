export interface SectorInfo {
  id: string;
  name: string;
  category: string;
  iconName: string;
  symbols: string[];
}

export const SECTORS_DATA: SectorInfo[] = [
  {
    id: 'it',
    name: 'Information Technology',
    category: 'Technology',
    iconName: 'Laptop',
    symbols: [
      'TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM', 'LTIM', 'PERSISTENT',
      'COFORGE', 'MPHASIS', 'KPITTECH', 'OFSS', 'TATAELXSI'
    ],
  },
  {
    id: 'banking',
    name: 'Banking & Financials',
    category: 'Finance',
    iconName: 'Building2',
    symbols: [
      'HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'BAJFINANCE', 'BAJAJFINSV',
      'CHOLAFIN', 'MUTHOOTFIN', 'BANDHANBNK', 'IDFCFIRSTB', 'INDUSINDBK', 'BANKBARODA', 'PNB', 'CANBK'
    ],
  },
  {
    id: 'auto',
    name: 'Auto & Retail',
    category: 'Automotive',
    iconName: 'Car',
    symbols: [
      'TATAMOTORS', 'MARUTI', 'M&M', 'BAJAJ-AUTO', 'EICHERMOT', 'HEROMOTOCO',
      'TVSMOTOR', 'ASHOKLEY', 'BHARATFORG', 'SONACOMS'
    ],
  },
  {
    id: 'pharma',
    name: 'Healthcare & Pharma',
    category: 'Healthcare',
    iconName: 'Pill',
    symbols: [
      'SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'APOLLOHOSP', 'MAXHEALTH',
      'FORTIS', 'GLENMARK', 'MANKIND', 'LUPIN', 'AUROPHARMA', 'BIOCON', 'TORNTPHARM'
    ],
  },
  {
    id: 'metals',
    name: 'Metals & Mining',
    category: 'Commodities',
    iconName: 'Hammer',
    symbols: [
      'TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'COALINDIA', 'VEDL', 'NATIONALUM',
      'SAIL', 'NMDC', 'HINDCOPPER', 'JINDALSTEL'
    ],
  },
  {
    id: 'fmcg',
    name: 'Consumer Goods & FMCG',
    category: 'Consumer',
    iconName: 'ShoppingBag',
    symbols: [
      'ITC', 'HINDUNILVR', 'NESTLEIND', 'ASIANPAINT', 'BRITANNIA', 'TATACONSUM',
      'VBL', 'DABUR', 'MARICO', 'GODREJCP'
    ],
  },
  {
    id: 'energy',
    name: 'Energy, Oil & Gas',
    category: 'Energy',
    iconName: 'Flame',
    symbols: [
      'RELIANCE', 'ONGC', 'NTPC', 'POWERGRID', 'BPCL', 'IOC', 'GAIL',
      'TATAPOWER', 'SUZLON', 'OIL', 'HINDPETRO', 'ADANIENT'
    ],
  },
  {
    id: 'media',
    name: 'Media & Entertainment',
    category: 'Services',
    iconName: 'Tv',
    symbols: [
      'ZOMATO', 'PVRINOX', 'ZEEL', 'SUNTV', 'NAZARA', 'TV18BRDCST', 'NETWORK18'
    ],
  },
  {
    id: 'infra',
    name: 'Construction & Infra',
    category: 'Industrial',
    iconName: 'HardHat',
    symbols: [
      'LT', 'ULTRACEMCO', 'GRASIM', 'BEL', 'HAL', 'BHEL', 'IRFC', 'RVNL',
      'MAZDOCK', 'COCHINSHIP'
    ],
  },
];
