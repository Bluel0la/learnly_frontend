
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <Link to="#" className="hover:text-primary">About</Link>
          <Link to="#" className="hover:text-primary">Privacy</Link>
          <Link to="#" className="hover:text-primary">Contact</Link>
          <Link to="#" className="hover:text-primary">Docs</Link>
        </div>
        
        <div className="flex items-center space-x-2 order-3 md:order-2">
          <span>v1.0.0</span>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-primary"
          >
            GitHub
          </a>
        </div>
        
        <div className="text-xs text-gray-500 w-full md:w-auto order-2 md:order-3">
          Built with ❤️ using LLaMA + LangChain + FAISS
        </div>
      </div>
    </footer>
  );
};

export default Footer;
