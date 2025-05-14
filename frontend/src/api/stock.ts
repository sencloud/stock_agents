import { get, API_ENDPOINTS } from '../config/api';

// 基础金融产品接口
interface BaseFinancialProduct {
  code: string;
  name: string;
  market: string;
  industry: string;
  price: number;
  change: number;
}

// 股票
export interface StockInfo extends BaseFinancialProduct {}

// 基金
export interface FundInfo extends BaseFinancialProduct {
  fund_type: 'public' | 'private'; // 公募/私募
  fund_category: string; // ETF、LOF、封闭式等
  nav: number; // 净值
  nav_date: string; // 净值日期
}

// 期货
export interface FutureInfo extends BaseFinancialProduct {
  underlying: string; // 标的资产
  delivery_date: string; // 交割日期
  exchange: string; // 交易所
}

// 期权
export interface OptionInfo extends BaseFinancialProduct {
  underlying: string; // 标的资产
  expiry_date: string; // 到期日
  strike_price: number; // 行权价
  option_type: 'call' | 'put'; // 看涨/看跌
  exchange: string; // 交易所
}

// 通用响应接口
interface BaseResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface StockListResponse extends BaseResponse<StockInfo> {}
export interface FundListResponse extends BaseResponse<FundInfo> {}
export interface FutureListResponse extends BaseResponse<FutureInfo> {}
export interface OptionListResponse extends BaseResponse<OptionInfo> {}

// 通用查询参数
interface BaseParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface StockListParams extends BaseParams {
  market?: string;
  industry?: string;
}

export interface FundListParams extends BaseParams {
  fund_type?: 'public' | 'private';
  fund_category?: string;
}

export interface FutureListParams extends BaseParams {
  exchange?: string;
  underlying?: string;
}

export interface OptionListParams extends BaseParams {
  exchange?: string;
  underlying?: string;
  option_type?: 'call' | 'put';
}

export interface StockDetailResponse extends StockInfo {
  // 可以根据需要添加更多字段
}

export const stockApi = {
  /**
   * 获取股票列表
   */
  getStockList: (params: StockListParams) => {
    return get<StockListResponse>(API_ENDPOINTS.stocks.list, { params });
  },

  /**
   * 获取股票详情
   */
  getStockDetail: (code: string) => {
    return get<StockDetailResponse>(API_ENDPOINTS.stocks.detail(code));
  },

  /**
   * 获取基金列表
   */
  getFundList: (params: FundListParams) => {
    return get<FundListResponse>(API_ENDPOINTS.funds.list, { params });
  },

  /**
   * 获取期货列表
   */
  getFutureList: (params: FutureListParams) => {
    return get<FutureListResponse>(API_ENDPOINTS.futures.list, { params });
  },

  /**
   * 获取期权列表
   */
  getOptionList: (params: OptionListParams) => {
    return get<OptionListResponse>(API_ENDPOINTS.options.list, { params });
  }
}; 