from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Tushare API配置
    TUSHARE_TOKEN: str = "你的tushare token"
    
    # Deepseek API配置
    DEEPSEEK_API_KEY: str

    OPENAI_API_KEY: str
    OPENAI_BASE_URL: str
    
    # 应用配置
    PROJECT_NAME: str = "新致量化策略"
    API_V1_STR: str = "/api/v1"
    
    # 数据库配置
    DATABASE_URL: str | None = None
    
    # 日志配置
    LOG_LEVEL: str = "INFO"
    LOG_FILE_PATH: str = "logs/app.log"
    
    # 安全配置
    SECRET_KEY: str = "your_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings() 
