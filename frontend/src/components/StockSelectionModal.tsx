import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { MagnifyingGlassIcon as SearchIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { stockApi, StockInfo, FundInfo, FutureInfo, OptionInfo } from '../api/stock';

interface StockSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTickers: string[];
  onTickersChange: (tickers: string[]) => void;
}

interface Stock {
  code: string;
  name: string;
  market: string;
  industry: string;
  price: number;
  change: number;
}

const StockSelectionModal: React.FC<StockSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedTickers,
  onTickersChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedIndex, setSelectedIndex] = useState('');
  const [selectedFundType, setSelectedFundType] = useState<'public' | 'private' | ''>('');
  const [selectedExchange, setSelectedExchange] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<'call' | 'put' | ''>('');
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // 各类产品数据
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [funds, setFunds] = useState<FundInfo[]>([]);
  const [futures, setFutures] = useState<FutureInfo[]>([]);
  const [options, setOptions] = useState<OptionInfo[]>([]);

  // Mock data - 实际项目中应该从API获取
  const mockStocks: Stock[] = [
    { code: '600519', name: '贵州茅台', market: 'A股', industry: '白酒', price: 1800.50, change: 2.3 },
    { code: '000858', name: '五粮液', market: 'A股', industry: '白酒', price: 168.20, change: -1.2 },
    { code: '600036', name: '招商银行', market: 'A股', industry: '银行', price: 35.80, change: 0.8 },
  ];

  const mockETFs = [
    { code: '510300', name: '沪深300ETF', market: 'ETF', industry: '指数', price: 3.85, change: 0.5 },
    { code: '510500', name: '中证500ETF', market: 'ETF', industry: '指数', price: 6.23, change: -0.3 },
    { code: '159915', name: '创业板ETF', market: 'ETF', industry: '指数', price: 2.91, change: 1.2 },
  ];

  const mockBonds = [
    { code: '019666', name: '22国债01', market: '债券', industry: '国债', price: 99.50, change: 0.1 },
    { code: '019668', name: '22国债03', market: '债券', industry: '国债', price: 98.80, change: -0.2 },
  ];

  const mockOptions = [
    { code: '10003853', name: '沪深300股指期权', market: '期权', industry: '指数期权', price: 1.25, change: 5.2 },
    { code: '10003854', name: '上证50股指期权', market: '期权', industry: '指数期权', price: 0.85, change: -3.8 },
  ];

  const mockFutures = [
    { code: '000300', name: '沪深300指数期货', market: '期货', industry: '指数期货', price: 4500.00, change: 2.5 },
    { code: '000016', name: '上证50指数期货', market: '期货', industry: '指数期货', price: 2800.00, change: -1.8 },
  ];

  const categories = [
    { name: '股票', data: stocks },
    { name: '基金', data: funds },
    { name: '期货', data: futures },
    { name: '期权', data: options },
  ];

  const indices = [
    { name: '全部', value: '' },
    { name: '沪深300', value: 'CSI300', stocks: ['600519', '000858', '600036'] },
    { name: '上证50', value: 'SSE50', stocks: ['600519', '600036'] },
    { name: '中证500', value: 'CSI500', stocks: ['000858'] },
    { name: '创业板指', value: 'GEM', stocks: [] },
    { name: '科创50', value: 'STAR50', stocks: [] },
  ];

  const industries = [
    '全部行业',
    '白酒',
    '银行',
    '新能源',
    '医药',
    '科技',
    '消费',
    '地产',
    '有色',
    '军工',
  ];

  const fundTypes = [
    { name: '全部', value: '' },
    { name: '公募基金', value: 'public' },
    { name: '私募基金', value: 'private' },
  ];

  const exchanges = [
    { name: '全部', value: '' },
    { name: '上交所', value: 'SSE' },
    { name: '深交所', value: 'SZSE' },
    { name: '中金所', value: 'CFFEX' },
    { name: '上期所', value: 'SHFE' },
    { name: '大商所', value: 'DCE' },
    { name: '郑商所', value: 'CZCE' },
  ];

  const commodityTypes = [
    { name: '全部', value: '' },
    { name: '股指', value: 'index' },
    { name: '国债', value: 'bond' },
    { name: '商品', value: 'commodity' },
    { name: '外汇', value: 'forex' },
  ];

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        switch (activeTab) {
          case 0: // 股票
            response = await stockApi.getStockList({
              page: currentPage,
              pageSize,
              industry: selectedIndustry === '全部行业' ? undefined : selectedIndustry,
              search: searchTerm,
            });
            setStocks(response.data || []);
            setTotal(response.total);
            break;

          case 1: // 基金
            response = await stockApi.getFundList({
              page: currentPage,
              pageSize,
              fund_type: selectedFundType || undefined,
              search: searchTerm,
            });
            setFunds(response.data || []);
            setTotal(response.total);
            break;

          case 2: // 期货
            response = await stockApi.getFutureList({
              page: currentPage,
              pageSize,
              exchange: selectedExchange || undefined,
              search: searchTerm,
            });
            setFutures(response.data || []);
            setTotal(response.total);
            break;

          case 3: // 期权
            response = await stockApi.getOptionList({
              page: currentPage,
              pageSize,
              exchange: selectedExchange || undefined,
              option_type: selectedCommodity as 'call' | 'put' || undefined,
              search: searchTerm,
            });
            setOptions(response.data || []);
            setTotal(response.total);
            break;
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, selectedIndustry, selectedFundType, selectedExchange, selectedCommodity, searchTerm, activeTab]);

  // 获取当前标签页的数据
  const getCurrentData = () => {
    switch (activeTab) {
      case 0:
        return stocks;
      case 1:
        return funds;
      case 2:
        return futures;
      case 3:
        return options;
      default:
        return [];
    }
  };

  // 修改 getFilteredStocks 函数
  const getFilteredStocks = () => {
    const data = getCurrentData();
    
    if (!data || data.length === 0) {
      return [];
    }

    if (searchTerm) {
      return data.filter(item => 
        item?.code?.includes(searchTerm) || 
        item?.name?.includes(searchTerm)
      );
    }

    return data;
  };

  const handleStockSelect = (stock: Stock) => {
    if (!selectedTickers.includes(stock.code)) {
      onTickersChange([...selectedTickers, stock.code]);
    }
  };

  const handleStockRemove = (code: string) => {
    onTickersChange(selectedTickers.filter(t => t !== code));
  };

  // 获取当前标签页的表头
  const getTableHeaders = () => {
    switch (activeTab) {
      case 0: // 股票
        return [
          { key: 'code', label: '代码' },
          { key: 'name', label: '名称' },
          { key: 'market', label: '市场' },
          { key: 'industry', label: '行业' },
          { key: 'price', label: '最新价' },
          { key: 'change', label: '涨跌幅' },
        ];
      case 1: // 基金
        return [
          { key: 'code', label: '代码' },
          { key: 'name', label: '名称' },
          { key: 'fund_type', label: '基金类型' },
          { key: 'fund_category', label: '投资类型' },
          { key: 'nav', label: '最新净值' },
          { key: 'nav_date', label: '净值日期' },
          { key: 'change', label: '日涨跌幅' },
        ];
      case 2: // 期货
        return [
          { key: 'code', label: '合约代码' },
          { key: 'name', label: '合约名称' },
          { key: 'symbol', label: '标的代码' },
          { key: 'delivery_date', label: '交割日期' },
          { key: 'price', label: '最新价' },
          { key: 'change', label: '涨跌幅' },
        ];
      case 3: // 期权
        return [
          { key: 'code', label: '合约代码' },
          { key: 'name', label: '合约名称' },
          { key: 'underlying', label: '标的代码' },
          { key: 'option_type', label: '期权类型' },
          { key: 'strike_price', label: '行权价' },
          { key: 'expiry_date', label: '到期日' },
          { key: 'price', label: '最新价' },
          { key: 'change', label: '涨跌幅' },
        ];
      default:
        return [];
    }
  };

  // 渲染表格单元格内容
  const renderTableCell = (item: any, key: string) => {
    switch (key) {
      case 'change':
        return (
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${item[key] >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {item[key] > 0 ? '+' : ''}{item[key].toFixed(2)}%
          </td>
        );
      case 'price':
      case 'nav':
      case 'strike_price':
        return (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {item[key].toFixed(2)}
          </td>
        );
      case 'option_type':
        return (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {item[key] === 'call' ? '认购' : item[key] === 'put' ? '认沽' : '-'}
          </td>
        );
      case 'fund_type':
        return (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {item[key] === 'public' ? '公募' : item[key] === 'private' ? '私募' : '-'}
          </td>
        );
      default:
        return (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {item[key] || '-'}
          </td>
        );
    }
  };

  // Render filters based on active category
  const renderFilters = () => {
    switch (categories[activeTab]?.name) {
      case '股票':
        return (
          <>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="">行业筛选</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(e.target.value)}
            >
              <option value="">指数成分股</option>
              {indices.map(index => (
                <option key={index.value} value={index.value}>{index.name}</option>
              ))}
            </select>
          </>
        );

      case '基金':
        return (
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedFundType}
            onChange={(e) => setSelectedFundType(e.target.value as 'public' | 'private' | '')}
          >
            <option value="">基金类型</option>
            {fundTypes.map(type => (
              <option key={type.value} value={type.value}>{type.name}</option>
            ))}
          </select>
        );

      case '期权':
      case '期货':
        return (
          <>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value)}
            >
              <option value="">交易所</option>
              {exchanges.map(exchange => (
                <option key={exchange.value} value={exchange.value}>{exchange.name}</option>
              ))}
            </select>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value as 'call' | 'put' | '')}
            >
              <option value="">品种类型</option>
              {commodityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.name}</option>
              ))}
            </select>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">选择分析标的</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Panel */}
                <div className="w-48 border-r border-gray-200 bg-gray-50 p-4">
                  <Tab.Group vertical onChange={(index) => {
                    setActiveTab(index);
                    setCurrentPage(1); // 切换标签时重置页码
                    setSearchTerm(''); // 清空搜索条件
                    // 重置筛选条件
                    setSelectedIndustry('');
                    setSelectedIndex('');
                    setSelectedFundType('');
                    setSelectedExchange('');
                    setSelectedCommodity('');
                  }}>
                    <Tab.List className="flex flex-col space-y-2">
                      {categories.map((category, index) => (
                        <Tab
                          key={category.name}
                          className={({ selected }) =>
                            `${
                              selected
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                            } px-4 py-2 rounded-lg text-sm font-medium focus:outline-none`
                          }
                        >
                          {category.name}
                        </Tab>
                      ))}
                    </Tab.List>
                  </Tab.Group>
                </div>

                {/* Center Panel */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Search and Filters */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="搜索代码或名称..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                      {renderFilters()}
                    </div>
                  </div>

                  {/* Stock Table */}
                  <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {getTableHeaders().map((header) => (
                            <th key={header.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header.label}
                            </th>
                          ))}
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={getTableHeaders().length + 1} className="px-6 py-4 text-center">
                              加载中...
                            </td>
                          </tr>
                        ) : getFilteredStocks().length === 0 ? (
                          <tr>
                            <td colSpan={getTableHeaders().length + 1} className="px-6 py-4 text-center">
                              暂无数据
                            </td>
                          </tr>
                        ) : (
                          getFilteredStocks().map((item) => (
                            <tr key={item.code} className="hover:bg-gray-50">
                              {getTableHeaders().map((header) => (
                                renderTableCell(item, header.key)
                              ))}
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleStockSelect(item)}
                                  className={`${
                                    selectedTickers.includes(item.code)
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'text-blue-600 hover:text-blue-900'
                                  } px-3 py-1 rounded`}
                                  disabled={selectedTickers.includes(item.code)}
                                >
                                  {selectedTickers.includes(item.code) ? '已添加' : '添加'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-700">
                          显示第 <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> 到{' '}
                          <span className="font-medium">{Math.min(currentPage * pageSize, total)}</span> 条，
                          共 <span className="font-medium">{total}</span> 条
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(p => p + 1)}
                          disabled={currentPage * pageSize >= total}
                          className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                            currentPage * pageSize >= total
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel */}
                <div className="w-64 border-l border-gray-200 bg-gray-50 p-4 overflow-auto">
                  <h3 className="text-lg font-semibold mb-4">已选标的</h3>
                  <div className="space-y-2">
                    {selectedTickers?.map((code) => {
                      const allStocks = [...(mockStocks || []), ...(mockETFs || []), ...(mockBonds || []), ...(mockOptions || []), ...(mockFutures || [])];
                      const stock = allStocks.find(s => s?.code === code);
                      return stock && (
                        <div
                          key={code}
                          className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
                        >
                          <div>
                            <div className="font-medium text-sm">{stock.name}</div>
                            <div className="text-xs text-gray-500">{code}</div>
                          </div>
                          <button
                            onClick={() => handleStockRemove(code)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end gap-4">
                  <button
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    onClick={onClose}
                  >
                    取消
                  </button>
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={onClose}
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StockSelectionModal; 