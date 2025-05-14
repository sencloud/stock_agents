import axios, { AxiosRequestConfig } from 'axios';

// 根据环境设置API基础URL
const isDevelopment = process.env.NODE_ENV === 'development';
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000/api/v1' 
  : '/api/v1';

// 创建axios实例
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 这里可以添加token等认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          localStorage.removeItem('token');
          break;
        case 403:
          console.error('没有权限访问该资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('API请求错误:', error.response);
      }
    } else if (error.request) {
      console.error('网络错误，请检查网络连接');
    } else {
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 封装HTTP方法
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return instance.get(url, config);
};

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return instance.post(url, data, config);
};

export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return instance.put(url, data, config);
};

export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return instance.delete(url, config);
};

export const API_ENDPOINTS = {
  ai: {
    backtest: '/ai/backtest',
    analysis: '/ai/analysis',
  },
  stocks: {
    list: '/stocks/stocks',
    detail: (code: string) => `/api/stock/${code}`,
  },
  funds: {
    list: '/stocks/funds',
    detail: (code: string) => `/api/fund/${code}`,
  },
  futures: {
    list: '/stocks/futures',
    detail: (code: string) => `/api/future/${code}`,
  },
  options: {
    list: '/stocks/options',
    detail: (code: string) => `/api/option/${code}`,
  },
}; 