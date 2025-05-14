from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import ai, stock
from config import settings
from utils.logger import logger

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许前端开发服务器访问
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
)
logger.info("CORS中间件配置完成")

# 注册AI路由
app.include_router(
    ai.router,
    prefix=f"{settings.API_V1_STR}/ai",
    tags=["ai"]
)
logger.info("AI分析路由注册完成")

# 注册股票路由
app.include_router(
    stock.router,
    prefix=f"{settings.API_V1_STR}/stocks",
    tags=["stocks"]
)
logger.info("股票数据路由注册完成")

@app.on_event("startup")
async def startup_event():
    logger.info("应用启动")
    logger.info(f"项目名称: {settings.PROJECT_NAME}")
    logger.info(f"API版本: {settings.API_V1_STR}")

    # 检查 Tushare Token
    if not settings.TUSHARE_TOKEN:
        logger.error("Tushare token not configured")
        sys.exit(1)

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("应用关闭")

@app.get("/")
async def root():
    logger.debug("收到根路径请求")
    return {"message": "Welcome to 新致量化策略 API"} 