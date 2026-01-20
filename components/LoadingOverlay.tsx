
import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-plane text-blue-600 text-2xl animate-pulse"></i>
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">트래블 버디가 계획 중...</h3>
      <p className="text-slate-500 animate-bounce">최적의 동선과 맛집을 찾고 있어요!</p>
    </div>
  );
};

export default LoadingOverlay;
