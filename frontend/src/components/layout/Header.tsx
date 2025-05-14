import React from 'react';
import { Link } from 'react-router-dom';
import { GithubOutlined } from '@ant-design/icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto mr-3" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">新致智能体策略</span>
                <span className="text-sm text-gray-500">国内金融市场多智能体组合分析策略</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="https://github.com/sencloud/stock_agents" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <GithubOutlined className="text-2xl" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 