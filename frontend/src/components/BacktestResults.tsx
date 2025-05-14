import React from 'react';
import * as echarts from 'echarts';

interface BacktestMetrics {
  annual_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  volatility: number;
  win_rate: number;
  profit_factor: number;
  max_consecutive_wins: number;
  max_consecutive_losses: number;
  largest_winning_trade: number;
  largest_losing_trade: number;
  average_winning_trade: number;
  average_losing_trade: number;
  total_trades: number;
}

interface BacktestResultsProps {
  metrics: BacktestMetrics;
  portfolioValues: number[];
  dates: string[];
}

const BacktestResults: React.FC<BacktestResultsProps> = ({ metrics, portfolioValues, dates }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [chart, setChart] = React.useState<echarts.ECharts | null>(null);

  React.useEffect(() => {
    if (chartRef.current) {
      const newChart = echarts.init(chartRef.current);
      setChart(newChart);
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const date = params[0].axisValue;
            const value = params[0].data;
            return `${date}<br/>净值: ${value.toFixed(2)}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dates,
          axisLine: { lineStyle: { color: '#666' } },
          axisLabel: { color: '#666' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#666' } },
          axisLabel: { color: '#666' },
          splitLine: { lineStyle: { color: '#ddd', type: 'dashed' } }
        },
        series: [
          {
            name: '组合净值',
            type: 'line',
            smooth: true,
            data: portfolioValues,
            areaStyle: {
              opacity: 0.3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(58, 128, 255, 0.8)' },
                { offset: 1, color: 'rgba(58, 128, 255, 0.1)' }
              ])
            },
            lineStyle: { width: 2, color: '#3a80ff' },
            itemStyle: { color: '#3a80ff' }
          }
        ]
      };
      
      newChart.setOption(option);
      
      return () => {
        newChart.dispose();
      };
    }
  }, [dates, portfolioValues]);

  React.useEffect(() => {
    const handleResize = () => {
      if (chart) {
        chart.resize();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chart]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">回测结果分析</h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">年化收益率</div>
            <div className={`text-xl font-bold ${metrics.annual_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.annual_return.toFixed(2)}%
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">最大回撤</div>
            <div className="text-xl font-bold text-red-600">
              {metrics.max_drawdown.toFixed(2)}%
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">夏普比率</div>
            <div className="text-xl font-bold text-gray-800">
              {metrics.sharpe_ratio.toFixed(2)}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">波动率</div>
            <div className="text-xl font-bold text-gray-800">
              {metrics.volatility.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8">
          <div ref={chartRef} className="h-[400px] w-full" />
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">交易统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">总交易次数</span>
                <span className="font-medium">{metrics.total_trades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">胜率</span>
                <span className="font-medium">{metrics.win_rate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">盈亏比</span>
                <span className="font-medium">{metrics.profit_factor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最大连续盈利</span>
                <span className="font-medium">{metrics.max_consecutive_wins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最大连续亏损</span>
                <span className="font-medium">{metrics.max_consecutive_losses}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">收益分析</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">最大单笔盈利</span>
                <span className="font-medium text-green-600">
                  {metrics.largest_winning_trade.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最大单笔亏损</span>
                <span className="font-medium text-red-600">
                  {metrics.largest_losing_trade.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均盈利</span>
                <span className="font-medium text-green-600">
                  {metrics.average_winning_trade.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均亏损</span>
                <span className="font-medium text-red-600">
                  {metrics.average_losing_trade.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestResults; 