import axios from 'axios';
import { post, API_ENDPOINTS } from '../config/api';

export interface BacktestRequest {
  tickers: string[];
  start_date: string;
  end_date: string;
  initial_capital?: number;
  portfolio: { [key: string]: number };
  selected_analysts?: string[];
  model_name?: string;
  model_provider?: string;
}

export interface BacktestResponse {
  analysis: {
    decisions: {
      [ticker: string]: {
        action: string;
        quantity: number;
        confidence: number;
        reasoning: string;
      };
    };
    analyst_signals: {
      // ben_graham_agent 格式
      ben_graham_agent?: {
        [ticker: string]: {
          signal: string;
          confidence: number;
          reasoning: string;
        };
      };
      // risk_management_agent 格式
      risk_management_agent?: {
        [ticker: string]: {
          remaining_position_limit: number;
          current_price: number;
          reasoning: {
            portfolio_value: number;
            current_position: number;
            position_limit: number;
            remaining_limit: number;
            available_cash: number;
          };
        };
      };
    };
  };
  backtest: {
    sharpe_ratio: number | null;
    sortino_ratio: number | null;
    max_drawdown: number | null;
    long_short_ratio: number | null;
    gross_exposure: number | null;
    net_exposure: number | null;
    portfolio_values?: Array<{
      Date: string;
      "Portfolio Value": number;
    }>;
  };
}

export const runBacktest = async (request: BacktestRequest): Promise<BacktestResponse> => {
    return post<BacktestResponse>(API_ENDPOINTS.ai.backtest, request);
}; 

export const runAnalysis = async (request: BacktestRequest): Promise<BacktestResponse> => {
  return post<BacktestResponse>(API_ENDPOINTS.ai.analysis, request);
}; 