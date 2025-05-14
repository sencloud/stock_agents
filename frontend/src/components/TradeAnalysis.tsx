import React from 'react';
import { BacktestResponse } from '../api/ai';

interface TradeAnalysisProps {
  analysis: BacktestResponse['analysis'];
}

const TradeAnalysis: React.FC<TradeAnalysisProps> = ({ analysis }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">交易决策分析</h2>
      
      {/* 交易决策部分 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">交易决策</h3>
        {Object.entries(analysis.decisions).map(([ticker, decision]) => (
          <div key={ticker} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{ticker}</span>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full ${
                  decision.action === 'buy' ? 'bg-green-100 text-green-800' :
                  decision.action === 'sell' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {decision.action.toUpperCase()}
                </span>
                <span className="text-sm">数量: {decision.quantity}</span>
                <span className="text-sm">置信度: {decision.confidence}%</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{decision.reasoning}</p>
          </div>
        ))}
      </div>

      {/* 分析师信号部分 */}
      <div>
        <h3 className="text-xl font-semibold mb-4">分析师信号</h3>
        
        {/* Ben Graham 分析 */}
        {analysis.analyst_signals.ben_graham_agent && (
          <div className="mb-6">
            <h4 className="font-medium mb-3">Ben Graham 分析</h4>
            {Object.entries(analysis.analyst_signals.ben_graham_agent).map(([ticker, signal]) => (
              <div key={ticker} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{ticker}</span>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full ${
                      signal.signal === 'bullish' ? 'bg-green-100 text-green-800' :
                      signal.signal === 'bearish' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {signal.signal.toUpperCase()}
                    </span>
                    <span className="text-sm">置信度: {signal.confidence}%</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{signal.reasoning}</p>
              </div>
            ))}
          </div>
        )}

        {/* 风险管理分析 */}
        {analysis.analyst_signals.risk_management_agent && (
          <div>
            <h4 className="font-medium mb-3">风险管理分析</h4>
            {Object.entries(analysis.analyst_signals.risk_management_agent).map(([ticker, data]) => (
              <div key={ticker} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{ticker}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">当前价格: ¥{data.current_price}</span>
                    <span className="text-sm">剩余仓位限制: {data.remaining_position_limit}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>投资组合价值: ¥{data.reasoning.portfolio_value}</div>
                  <div>当前仓位: {data.reasoning.current_position}</div>
                  <div>仓位限制: {data.reasoning.position_limit}</div>
                  <div>剩余限制: {data.reasoning.remaining_limit}</div>
                  <div>可用现金: ¥{data.reasoning.available_cash}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeAnalysis;
