from fastapi import APIRouter, Query
from typing import List, Optional
from pydantic import BaseModel
import tushare as ts
from tools.data_fetcher import DataFetcher
from config import get_settings
from datetime import datetime, timedelta

router = APIRouter()

# 初始化tushare
settings = get_settings()
ts.set_token(settings.TUSHARE_TOKEN)
data_fetcher = DataFetcher(token=settings.TUSHARE_TOKEN)

class BaseFinancialProduct(BaseModel):
    code: str
    name: str
    market: str
    industry: str
    price: float
    change: float

class StockInfo(BaseFinancialProduct):
    pass

class FundInfo(BaseFinancialProduct):
    fund_type: str
    fund_category: str
    nav: float
    nav_date: str

class FutureInfo(BaseFinancialProduct):
    symbol: str  # 合约标的
    delivery_date: str
    exchange: str

class OptionInfo(BaseFinancialProduct):
    underlying: str
    expiry_date: str
    strike_price: float
    option_type: str
    exchange: str

@router.get("/stocks", response_model=dict)
async def get_stocks(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    market: Optional[str] = None,
    industry: Optional[str] = None,
    search: Optional[str] = None
):
    """
    获取股票列表，支持分页和过滤
    """
    try:
        # 获取基础数据
        df = ts.pro_api().stock_basic(
            exchange='',
            list_status='L',
            fields='ts_code,symbol,name,area,industry,market,list_date'
        )
        
        # 应用过滤条件
        if market:
            df = df[df['market'] == market]
        if industry:
            df = df[df['industry'] == industry]
        if search:
            df = df[df['name'].str.contains(search) | df['ts_code'].str.contains(search)]
            
        # 计算总记录数
        total = len(df)
        
        # 应用分页
        start = (page - 1) * page_size
        end = start + page_size
        df = df.iloc[start:end]
        
        # 获取最新行情数据
        stocks = []
        for _, row in df.iterrows():
            try:
                # 获取最新行情
                daily = ts.pro_api().daily(ts_code=row['ts_code'], limit=1)
                if not daily.empty:
                    price = daily['close'].iloc[0]
                    change = daily['pct_chg'].iloc[0]
                else:
                    price = 0.0
                    change = 0.0
                    
                stocks.append(StockInfo(
                    code=row['ts_code'],
                    name=row['name'],
                    market=row['market'],
                    industry=row['industry'] or '未知',
                    price=price,
                    change=change
                ))
            except Exception as e:
                print(f"Error fetching data for {row['ts_code']}: {str(e)}")
                continue
                
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": stocks
        }
        
    except Exception as e:
        print(f"Error in get_stocks: {str(e)}")
        return {
            "total": 0,
            "page": page,
            "page_size": page_size,
            "data": []
        }

@router.get("/stock/{code}")
async def get_stock_detail(code: str):
    """
    获取单个股票的详细信息
    """
    try:
        # 获取股票基本信息
        stock_info = data_fetcher.get_stock_info(code)
        if not stock_info:
            return {"error": "Stock not found"}
            
        # 获取最新行情
        daily = ts.pro_api().daily(ts_code=code, limit=1)
        if not daily.empty:
            price = daily['close'].iloc[0]
            change = daily['pct_chg'].iloc[0]
        else:
            price = 0.0
            change = 0.0
            
        return {
            **stock_info,
            "price": price,
            "change": change
        }
        
    except Exception as e:
        print(f"Error in get_stock_detail: {str(e)}")
        return {"error": str(e)}

@router.get("/funds", response_model=dict)
async def get_funds(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    fund_type: Optional[str] = None,
    fund_category: Optional[str] = None,
    search: Optional[str] = None
):
    """
    获取基金列表，支持分页和过滤
    """
    try:
        # 获取基金列表
        df = ts.pro_api().fund_basic(
            market='E',  # E场内 O场外
            status='L'   # L上市 D退市 P发行
        )
        
        # 应用过滤条件
        if fund_type:
            df = df[df['fund_type'] == fund_type]
        if fund_category:
            df = df[df['type'] == fund_category]
        if search:
            df = df[df['name'].str.contains(search) | df['ts_code'].str.contains(search)]
            
        total = len(df)
        
        # 应用分页
        start = (page - 1) * page_size
        end = start + page_size
        df = df.iloc[start:end]
        
        # 获取基金数据
        funds = []
        for _, row in df.iterrows():
            try:
                # 获取最新净值
                nav_data = ts.pro_api().fund_nav(
                    ts_code=row['ts_code'],
                    limit=1,
                    fields='ts_code,nav_date,adj_nav,acc_nav,unit_nav'
                )
                
                if not nav_data.empty:
                    nav = float(nav_data['adj_nav'].iloc[0]) if 'adj_nav' in nav_data.columns else float(nav_data['unit_nav'].iloc[0])
                    nav_date = nav_data['nav_date'].iloc[0]
                    # 计算涨跌幅，这里简化处理，实际应该获取前一日净值计算
                    change = 0.0
                else:
                    nav = 0.0
                    nav_date = datetime.now().strftime('%Y%m%d')
                    change = 0.0
                
                funds.append(FundInfo(
                    code=row['ts_code'],
                    name=row['name'],
                    market='场内基金' if row['market'] == 'E' else '场外基金',
                    industry=row['type'] if 'type' in row else row['fund_type'],
                    price=nav,
                    change=change,
                    fund_type='public' if row['fund_type'] in ['ETF', 'LOF', 'FOF'] else 'private',
                    fund_category=row['type'] if 'type' in row else row['fund_type'],
                    nav=nav,
                    nav_date=nav_date
                ))
            except Exception as e:
                print(f"Error fetching fund data for {row['ts_code']}: {str(e)}")
                continue
                
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": funds
        }
        
    except Exception as e:
        print(f"Error in get_funds: {str(e)}")
        return {
            "total": 0,
            "page": page,
            "page_size": page_size,
            "data": []
        }

@router.get("/futures", response_model=dict)
async def get_futures(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    exchange: Optional[str] = 'CFFEX',
    underlying: Optional[str] = None,
    search: Optional[str] = None
):
    """
    获取期货列表，支持分页和过滤，只显示当年合约
    """
    try:
        # 获取期货合约信息
        df = ts.pro_api().fut_basic(
            exchange=exchange,  # 默认为中金所
            fut_type='1'  # 1普通期货 2期货指数 3期转现
        )
        print(f"Initial futures data count: {len(df)}")
        print(f"Sample ts_codes: {df['ts_code'].head().tolist()}")
        
        # 过滤当年合约
        current_year = str(datetime.now().year)[-2:]  # 只取年份后两位
        print(f"Filtering for year: {current_year}")
        print(f"Sample year parts: {[code[1:3] for code in df['ts_code'].head().tolist()]}")
        
        df = df[df['ts_code'].str[1:3] == current_year]  # 期货合约代码第2-3位是年份
        print(f"After year filtering count: {len(df)}")
        
        # 如果指定了交易所，则过滤
        if exchange:
            print(f"Filtering for exchange: {exchange}")
            df = df[df['exchange'] == exchange]
            print(f"After exchange filtering count: {len(df)}")

        # 应用过滤条件
        if underlying:
            print(f"Filtering for underlying: {underlying}")
            df = df[df['underlying'] == underlying]
            print(f"After underlying filtering count: {len(df)}")
        if search:
            print(f"Filtering for search: {search}")
            df = df[df['name'].str.contains(search) | df['ts_code'].str.contains(search)]
            print(f"After search filtering count: {len(df)}")
            
        total = len(df)
        print(f"Final data count before paging: {total}")
        if total > 0:
            print(f"Remaining ts_codes: {df['ts_code'].tolist()}")
        
        # 应用分页
        start = (page - 1) * page_size
        end = start + page_size
        df = df.iloc[start:end]
        
        # 获取期货数据
        futures = []
        for _, row in df.iterrows():
            try:
                # 获取最新行情
                daily = ts.pro_api().fut_daily(
                    ts_code=row['ts_code'],
                    start_date=(datetime.now() - timedelta(days=7)).strftime('%Y%m%d'),  # 获取最近7天数据
                    end_date=datetime.now().strftime('%Y%m%d'),
                    fields='ts_code,trade_date,close,pre_settle,settle,change1'
                )
                
                if not daily.empty:
                    price = daily['close'].iloc[0]
                    # 使用 change1 (收盘价-昨结算价) 作为涨跌幅
                    change = daily['change1'].iloc[0] if 'change1' in daily.columns else 0.0
                    # 如果没有 change1，则用 (收盘价-昨结算价)/昨结算价 计算
                    if change == 0.0 and 'pre_settle' in daily.columns and daily['pre_settle'].iloc[0] != 0:
                        change = (price - daily['pre_settle'].iloc[0]) / daily['pre_settle'].iloc[0] * 100
                else:
                    price = 0.0
                    change = 0.0
                
                futures.append(FutureInfo(
                    code=row['ts_code'],
                    name=row['name'],
                    market=row['exchange'],
                    industry=row['product_type'] if 'product_type' in row else row.get('class', '其他'),
                    price=price,
                    change=change,
                    symbol=row['ts_code'].split('.')[0],  # 从合约代码中提取标的代码
                    delivery_date=row['last_trade_date'] if 'last_trade_date' in row else '',  # 使用最后交易日期
                    exchange=row['exchange']
                ))
            except Exception as e:
                print(f"Error fetching future data for {row['ts_code']}: {str(e)}")
                continue
                
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": futures
        }
        
    except Exception as e:
        print(f"Error in get_futures: {str(e)}")
        return {
            "total": 0,
            "page": page,
            "page_size": page_size,
            "data": []
        }

@router.get("/options", response_model=dict)
async def get_options(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    exchange: Optional[str] = None,
    option_type: Optional[str] = None,
    underlying: Optional[str] = None,
    search: Optional[str] = None
):
    """
    获取期权列表，支持分页和过滤，只显示当年合约
    """
    try:
        # 获取期权合约信息
        df = ts.pro_api().opt_basic(
            exchange='SSE',  # 默认为上交所
            call_put=option_type if option_type else ''
        )
        
        # 过滤当年合约
        current_year = str(datetime.now().year)[-2:]  # 只取年份后两位
        df = df[df['maturity_date'].str.startswith(current_year)]
        
        # 如果指定了交易所，则过滤
        if exchange:
            df = df[df['exchange'] == exchange]
            
        # 应用过滤条件
        if underlying:
            df = df[df['underlying_symbol'] == underlying]  # 使用 underlying_symbol 替代 underlying_code
        if search:
            df = df[df['name'].str.contains(search) | df['ts_code'].str.contains(search)]
            
        total = len(df)
        
        # 应用分页
        start = (page - 1) * page_size
        end = start + page_size
        df = df.iloc[start:end]
        
        # 获取期权数据
        options = []
        for _, row in df.iterrows():
            try:
                # 获取最新行情
                daily = ts.pro_api().opt_daily(
                    ts_code=row['ts_code'],
                    start_date=(datetime.now() - timedelta(days=7)).strftime('%Y%m%d'),  # 获取最近7天数据
                    end_date=datetime.now().strftime('%Y%m%d'),
                    fields='ts_code,trade_date,close,pre_settle,settle'
                )
                
                if not daily.empty:
                    price = daily['close'].iloc[0]
                    # 使用 (收盘价-昨结算价)/昨结算价 计算涨跌幅
                    pre_settle = daily['pre_settle'].iloc[0] if 'pre_settle' in daily.columns else price
                    change = ((price - pre_settle) / pre_settle * 100) if pre_settle != 0 else 0.0
                else:
                    price = 0.0
                    change = 0.0
                
                options.append(OptionInfo(
                    code=row['ts_code'],
                    name=row['name'],
                    market=row['exchange'],
                    industry='期权',
                    price=price,
                    change=change,
                    underlying=row['underlying_code'] if 'underlying_code' in row else row['ts_code'].split('.')[0][:6],  # 从合约代码中提取标的代码
                    expiry_date=row['maturity_date'] if 'maturity_date' in row else row['last_trade_date'],
                    strike_price=float(row['exercise_price']) if 'exercise_price' in row else 0.0,
                    option_type=row['call_put'] if 'call_put' in row else '',
                    exchange=row['exchange']
                ))
            except Exception as e:
                print(f"Error fetching option data for {row['ts_code']}: {str(e)}")
                continue
                
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "data": options
        }
        
    except Exception as e:
        print(f"Error in get_options: {str(e)}")
        return {
            "total": 0,
            "page": page,
            "page_size": page_size,
            "data": []
        } 