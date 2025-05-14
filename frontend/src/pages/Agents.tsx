import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import BacktestResults from '../components/BacktestResults';
import TradeAnalysis from '../components/TradeAnalysis';
import StockSelectionModal from '../components/StockSelectionModal';
import { runBacktest, runAnalysis, BacktestResponse } from '../api/ai';
import { XMarkIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Stock, mockStocks, mockETFs, mockBonds, mockOptions, mockFutures } from '../data/mockData';

// 金融专家数据
const experts = [
  {
    id: 1,
    name: 'Ben Graham',
    title: '价值投资之父',
    avatar: '/images/experts/ben-graham.jpg',
    description: '本杰明·格雷厄姆是价值投资的奠基人，著有《证券分析》和《聪明的投资者》。他强调安全边际、内在价值和市场先生的概念，影响了包括沃伦·巴菲特在内的众多投资者。',
    specialties: ['价值投资', '安全边际', '基本面分析'],
    performance: 15.2,
    riskLevel: '低',
    recommendation: '始终保持安全边际，寻找市值低于有形资产账面价值的股票。优先考虑市盈率低、股息率高的大盘股，规避投机性资产。在市场恐慌时逢低买入优质资产。'
  },
  {
    id: 2,
    name: 'Bill Ackman',
    title: '激进投资者',
    avatar: '/images/experts/bill-ackman.jpg',
    description: '比尔·阿克曼是潘兴广场资本管理的创始人，以激进投资策略和公开市场活动而闻名。他擅长通过深入研究和积极股东主义创造价值。',
    specialties: ['激进投资', '事件驱动', '公开市场活动'],
    performance: 18.7,
    riskLevel: '高',
    recommendation: '集中持仓高确信度标的，积极参与公司治理。关注特殊情况投资机会，如分拆、重组、收购等公司事件。采用期权等衍生品进行风险对冲。'
  },
  {
    id: 3,
    name: 'Cathie Wood',
    title: '颠覆性创新投资者',
    avatar: '/images/experts/cathie-wood.jpg',
    description: '凯茜·伍德是方舟投资管理公司的创始人，专注于颠覆性创新技术投资。她相信技术创新将重塑传统行业，包括农业和食品生产。',
    specialties: ['颠覆性创新', '长期投资', '技术趋势'],
    performance: 22.5,
    riskLevel: '高',
    recommendation: '重点布局人工智能、基因编辑、区块链等颠覆性科技领域。看好新能源、太空经济等未来产业。愿意承担短期波动换取长期超额收益。'
  },
  {
    id: 4,
    name: 'Charlie Munger',
    title: '伯克希尔副董事长',
    avatar: '/images/experts/charlie-munger.jpg',
    description: '查理·芒格是伯克希尔·哈撒韦公司的副董事长，沃伦·巴菲特的长期合作伙伴。他以多学科思维模型和逆向思维而闻名。',
    specialties: ['多学科思维', '逆向投资', '长期持有'],
    performance: 16.8,
    riskLevel: '中',
    recommendation: '专注于具有持久竞争优势的优质企业，重视企业文化与管理层能力。保持耐心，在市场低估时大举建仓。避免过度分散，集中投资最有把握的标的。'
  },
  {
    id: 5,
    name: 'Michael Burry',
    title: '大空头',
    avatar: '/images/experts/michael-burry.jpg',
    description: '迈克尔·伯里是Scion资产管理公司的创始人，因在2008年金融危机前做空次贷市场而闻名。他擅长发现市场非理性和泡沫。',
    specialties: ['逆向投资', '市场泡沫识别', '宏观分析'],
    performance: 19.3,
    riskLevel: '高',
    recommendation: '警惕市场过度投机带来的系统性风险。关注宏观经济指标与市场结构性问题。在识别到显著错误定价时，采取高确信度的逆向押注。'
  },
  {
    id: 6,
    name: 'Peter Lynch',
    title: '成长型投资大师',
    avatar: '/images/experts/peter-lynch.jpg',
    description: '彼得·林奇是富达麦哲伦基金的前经理，以识别高增长公司而闻名。他相信投资者应该投资于他们了解的行业。',
    specialties: ['成长型投资', '实地调研', '行业洞察'],
    performance: 17.6,
    riskLevel: '中',
    recommendation: '投资你了解的行业，关注高速成长但股价还未充分反映增长的公司。重视实地调研，从消费者角度发现投资机会。估值与增长相匹配很重要。'
  },
  {
    id: 7,
    name: 'Phil Fisher',
    title: '成长型投资先驱',
    avatar: '/images/experts/phil-fisher.jpg',
    description: '菲利普·费雪是成长型投资的先驱，著有《怎样选择成长股》。他强调通过深入研究和长期持有优质公司来获得超额回报。',
    specialties: ['成长型投资', '公司质量分析', '长期持有'],
    performance: 14.9,
    riskLevel: '中',
    recommendation: '寻找具有卓越研发能力和销售组织的公司，关注管理层质量和企业文化。通过深入调研（费雪探路法）建立高确信度，然后长期持有。'
  },
  {
    id: 8,
    name: 'Stanley Druckenmiller',
    title: '宏观交易大师',
    avatar: '/images/experts/stanley-druckenmiller.jpg',
    description: '斯坦利·德鲁肯米勒是杜肯家族办公室的创始人，以宏观交易和货币投资而闻名。他擅长通过宏观经济分析预测市场趋势。',
    specialties: ['宏观交易', '货币投资', '趋势跟踪'],
    performance: 21.4,
    riskLevel: '高',
    recommendation: '根据全球宏观经济周期和政策变化调整资产配置。在确认趋势后果断加仓，使用杠杆放大收益。擅长通过货币、大宗商品和利率市场捕捉机会。'
  },
  {
    id: 9,
    name: 'Warren Buffett',
    title: '奥马哈先知',
    avatar: '/images/experts/warren-buffett.jpg',
    description: '沃伦·巴菲特是伯克希尔·哈撒韦公司的董事长兼CEO，被誉为"奥马哈先知"。他以价值投资和长期持有优质公司而闻名。',
    specialties: ['价值投资', '企业质量分析', '长期持有'],
    performance: 20.1,
    riskLevel: '中',
    recommendation: '专注于具有护城河的优质企业，寻找定价合理的伟大公司而不是便宜的普通公司。重视企业的品牌价值、定价权和资本回报率，耐心等待合适的买入时机。'
  },
  {
    id: 10,
    name: '李录',
    title: '东方价值投资大师',
    avatar: '/images/experts/li-lu.jpg',
    description: '李录是喜马拉雅资本的创始人，以逆向投资和价值投资深化而闻名。他将东方哲学与西方价值投资理念相结合，创造了独特的投资方法论。',
    specialties: ['逆向投资', '极度集中', '价值投资'],
    performance: 25.3,
    riskLevel: '高',
    recommendation: '在市场恐慌时逆向布局，极度集中持仓6-7只股票。强调"购买力占比"思维，关注企业核心竞争力与长期增长潜力，而非短期估值高低。'
  },
  {
    id: 11,
    name: '林园',
    title: '消费领域投资专家',
    avatar: '/images/experts/lin-yuan.jpg',
    description: '林园从8000元起步，通过专注消费领域投资，历经多轮牛熊市积累了巨额财富。他以确定性投资和长期主义著称。',
    specialties: ['消费投资', '确定性投资', '长期持有'],
    performance: 23.8,
    riskLevel: '中',
    recommendation: '专注消费领域，特别是具有"成瘾性"和垄断性的企业，如白酒和中药龙头。通过业绩增长与利润积累实现复利效应，坚持长期持有优质资产。'
  },
  {
    id: 12,
    name: '段永平',
    title: '商业模式投资家',
    avatar: '/images/experts/duan-yongping.jpg',
    description: '段永平以投资网易、腾讯、苹果等科技公司而闻名，擅长深度研究企业商业模式，并在市场波动时保持逆向思维。',
    specialties: ['商业模式分析', '逆向投资', '风险对冲'],
    performance: 24.5,
    riskLevel: '中',
    recommendation: '通过深度研究企业商业模式构建能力圈，在市场恐慌时逆向布局。善用看跌期权等工具对冲风险，保持极度集中持仓策略。'
  }
];

interface SelectedTickersDisplayProps {
  selectedTickers: Stock[];
  onRemoveTicker: (code: string) => void;
  onClearAll: () => void;
}

const SelectedTickersDisplay: React.FC<SelectedTickersDisplayProps> = ({ selectedTickers, onRemoveTicker, onClearAll }) => {
  if (!selectedTickers || selectedTickers.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">已选标的</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-red-600 hover:text-red-800"
        >
          清空
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedTickers.map((ticker: Stock) => (
          <div
            key={ticker.code}
            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
          >
            <span className="text-sm">
              {ticker.name} ({ticker.code})
            </span>
            <button
              onClick={() => onRemoveTicker(ticker.code)}
              className="text-gray-500 hover:text-red-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Agents: React.FC = () => {
  const [selectedExperts, setSelectedExperts] = useState<number[]>([1]); // Ben Graham's ID is 1
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [showBacktest, setShowBacktest] = useState(false);
  const [selectedTickers, setSelectedTickers] = useState<string[]>(['600519']);
  const [backtestData, setBacktestData] = useState<{
    metrics: any;
    portfolioValues: number[];
    dates: string[];
    analysis?: BacktestResponse['analysis'];
  } | null>(null);

  const getAnalystId = (expertId: number): string => {
    const nameMap: { [key: number]: string } = {
      1: 'ben_graham',
      2: 'bill_ackman',
      3: 'cathie_wood',
      4: 'charlie_munger',
      5: 'michael_burry',
      6: 'peter_lynch',
      7: 'phil_fisher',
      8: 'stanley_druckenmiller',
      9: 'warren_buffett',
      10: 'li_lu',
      11: 'lin_yuan',
      12: 'duan_yongping'
    };
    return nameMap[expertId] || '';
  };

  const handleBacktest = async () => {
    if (!startDate || !endDate) {
      alert('请选择开始和结束日期');
      return;
    }

    setLoading(true);
    try {
      const request = {
        tickers: selectedTickers,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        initial_capital: 100000,
        portfolio: {
          '国债': 40,
          'ETF': 30,
          '股票': 25,
          '期权': 5
        },
        selected_analysts: selectedExperts.map(id => getAnalystId(id)),
        model_name: 'bot-20250329163710-8zcqm',
        model_provider: 'OpenAI'
      };

      const response = await runBacktest(request);
      
      setBacktestData({
        metrics: {
          annual_return: 0,
          max_drawdown: response.backtest.max_drawdown || 0,
          sharpe_ratio: response.backtest.sharpe_ratio || 0,
          volatility: 0,
          win_rate: 0,
          profit_factor: 0,
          max_consecutive_wins: 0,
          max_consecutive_losses: 0,
          largest_winning_trade: 0,
          largest_losing_trade: 0,
          average_winning_trade: 0,
          average_losing_trade: 0,
          total_trades: 0
        },
        portfolioValues: (response.backtest.portfolio_values?.map((pv: { "Portfolio Value": number }) => pv["Portfolio Value"])) || [],
        dates: (response.backtest.portfolio_values?.map((pv: { Date: string }) => pv.Date)) || [],
        analysis: response.analysis
      });
      
      setShowBacktest(true);
    } catch (error) {
      console.error('Error running backtest:', error);
      alert('回测分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysis = async () => {
    if (!startDate || !endDate) {
      alert('请选择开始和结束日期');
      return;
    }

    setAnalysisLoading(true);
    try {
      const request = {
        tickers: selectedTickers,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        initial_capital: 100000,
        portfolio: {
          '国债': 40,
          'ETF': 30,
          '股票': 25,
          '期权': 5
        },
        selected_analysts: selectedExperts.map(id => getAnalystId(id)),
        model_name: 'bot-20250329163710-8zcqm',
        model_provider: 'OpenAI'
      };

      const response = await runAnalysis(request);
      if (backtestData) {
        setBacktestData({
          ...backtestData,
          analysis: response.analysis
        });
      } else {
        setBacktestData({
          metrics: {},
          portfolioValues: [],
          dates: [],
          analysis: response.analysis
        });
      }
      setShowBacktest(true);
    } catch (error) {
      console.error('Error running analysis:', error);
      alert('分析失败，请重试');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const toggleExpertSelection = (expertId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (expertId === 1) return; // Ben Graham cannot be unselected
    
    setSelectedExperts(prev => 
      prev.includes(expertId) 
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            多智能体组合分析策略
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            基于12位金融专家的投资理念和策略，构建智能体组合分析系统，对给定标的组合进行分析和回测
          </p>
        </div>

        {/* Experts Grid */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {experts.map(expert => (
              <div 
                key={expert.id}
                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow relative"
                onClick={() => {
                  setSelectedExpert(expert.id);
                  setShowExpertModal(true);
                }}
              >
                <div 
                  className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 
                    ${selectedExperts.includes(expert.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} 
                    ${expert.id === 1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  onClick={(e) => toggleExpertSelection(expert.id, e)}
                >
                  {selectedExperts.includes(expert.id) && (
                    <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <img 
                    src={expert.avatar} 
                    alt={expert.name}
                    className="w-20 h-20 rounded-full mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{expert.name}</h3>
                  <p className="text-sm text-gray-500">{expert.title}</p>
                  <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium
                    ${expert.riskLevel === '高' ? 'bg-red-100 text-red-800' : 
                      expert.riskLevel === '中' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}`}>
                    风险等级：{expert.riskLevel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backtest Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={startDate?.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={endDate?.toISOString().split('T')[0]}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <div className="flex items-end">
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowStockModal(true)}
              >
                <PlusCircleIcon className="h-5 w-5" />
                <span>添加标的</span>
              </button>
            </div>
            <div className="flex items-end gap-2">
              <button
                className="w-1/2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                onClick={handleAnalysis}
                disabled={analysisLoading || !startDate || !endDate}
              >
                {analysisLoading ? '分析中...' : '组合分析'}
              </button>
              <button
                className="w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                onClick={handleBacktest}
                disabled={loading || !startDate || !endDate}
              >
                {loading ? '回测中...' : '策略回测'}
              </button>
            </div>
          </div>

          {/* Selected Tickers Display */}
          {selectedTickers.length > 0 && (
            <SelectedTickersDisplay
              selectedTickers={selectedTickers.map(code => {
                const allData = [...mockStocks, ...mockETFs, ...mockBonds, ...mockOptions, ...mockFutures];
                const item = allData.find(s => s.code === code);
                return item || { code, name: code, market: '', industry: '', price: 0, change: 0 };
              })}
              onRemoveTicker={(code: string) => setSelectedTickers(prev => prev.filter(t => t !== code))}
              onClearAll={() => setSelectedTickers([])}
            />
          )}
        </div>

        {/* Backtest Results */}
        {showBacktest && backtestData && (
          <>
            <TradeAnalysis analysis={backtestData.analysis!} />
            {backtestData.portfolioValues && backtestData.portfolioValues.length > 0 && (
              <BacktestResults
                metrics={backtestData.metrics}
                portfolioValues={backtestData.portfolioValues}
                dates={backtestData.dates}
              />
            )}
          </>
        )}

        {/* Expert Modal */}
        {showExpertModal && selectedExpert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {experts.find(e => e.id === selectedExpert)?.name}
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowExpertModal(false)}
                  >
                    ✕
                  </button>
                </div>
                {/* Expert details content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={experts.find(e => e.id === selectedExpert)?.avatar}
                      alt=""
                      className="w-24 h-24 rounded-full"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">
                        {experts.find(e => e.id === selectedExpert)?.title}
                      </h3>
                      <p className="text-gray-600">
                        年化收益: {experts.find(e => e.id === selectedExpert)?.performance}%
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {experts.find(e => e.id === selectedExpert)?.description}
                  </p>
                  <div>
                    <h4 className="font-semibold mb-2">专业领域</h4>
                    <div className="flex flex-wrap gap-2">
                      {experts.find(e => e.id === selectedExpert)?.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">投资理念与风格</h4>
                    <p className="text-gray-600">
                      {experts.find(e => e.id === selectedExpert)?.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stock Selection Modal */}
        <StockSelectionModal
          isOpen={showStockModal}
          onClose={() => setShowStockModal(false)}
          selectedTickers={selectedTickers}
          onTickersChange={setSelectedTickers}
        />
      </div>
    </Layout>
  );
};

export default Agents; 