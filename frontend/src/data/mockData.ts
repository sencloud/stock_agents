export interface Stock {
  code: string;
  name: string;
  market: string;
  industry: string;
  price: number;
  change: number;
}

export const mockStocks: Stock[] = [
  { code: '600519', name: '贵州茅台', market: 'A股', industry: '白酒', price: 1800.50, change: 2.3 },
  { code: '000858', name: '五粮液', market: 'A股', industry: '白酒', price: 168.20, change: -1.2 },
  { code: '600036', name: '招商银行', market: 'A股', industry: '银行', price: 35.80, change: 0.8 },
];

export const mockETFs: Stock[] = [
  { code: '510300', name: '沪深300ETF', market: 'ETF', industry: '指数', price: 3.85, change: 0.5 },
  { code: '510500', name: '中证500ETF', market: 'ETF', industry: '指数', price: 6.23, change: -0.3 },
  { code: '159915', name: '创业板ETF', market: 'ETF', industry: '指数', price: 2.91, change: 1.2 },
];

export const mockBonds: Stock[] = [
  { code: '019666', name: '22国债01', market: '债券', industry: '国债', price: 99.50, change: 0.1 },
  { code: '019668', name: '22国债03', market: '债券', industry: '国债', price: 98.80, change: -0.2 },
];

export const mockOptions: Stock[] = [
  { code: '10003853', name: '沪深300股指期权', market: '期权', industry: '指数期权', price: 1.25, change: 5.2 },
  { code: '10003854', name: '上证50股指期权', market: '期权', industry: '指数期权', price: 0.85, change: -3.8 },
];

export const mockFutures: Stock[] = [
  { code: '000300', name: '沪深300指数期货', market: '期货', industry: '指数期货', price: 4500.00, change: 2.5 },
  { code: '000016', name: '上证50指数期货', market: '期货', industry: '指数期货', price: 2800.00, change: -1.8 },
]; 