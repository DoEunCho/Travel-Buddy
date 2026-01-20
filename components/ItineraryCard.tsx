
import React, { useState } from 'react';
import { DayPlan, Activity } from '../types';

interface Props {
  plan: DayPlan;
}

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative pl-10 group/item">
      <div className="absolute left-0 top-1.5 w-[32px] h-[32px] bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center z-10 group-hover/item:border-blue-500 group-hover/item:scale-110 transition-all shadow-sm">
        <i className={`fa-solid ${
          activity.time === '오전' ? 'fa-sun text-orange-400' :
          activity.time === '오후' ? 'fa-cloud-sun text-blue-400' : 'fa-moon text-indigo-400'
        } text-xs`}></i>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wider uppercase ${
          activity.time === '오전' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
          activity.time === '오후' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
        }`}>
          {activity.time}
        </span>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="font-black text-slate-800 text-lg hover:text-blue-600 transition-colors underline decoration-slate-200 decoration-2 underline-offset-4 hover:decoration-blue-400 text-left"
        >
          {activity.place}
        </button>
        {activity.transportInfo && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
            <i className="fa-solid fa-route text-[10px]"></i>
            {activity.transportInfo}
          </div>
        )}
      </div>
      
      {/* Expanded Address & Map Link */}
      {showDetails && (
        <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-start gap-2">
              <i className="fa-solid fa-location-dot text-blue-500 mt-0.5"></i>
              <span className="text-xs font-bold text-slate-600 leading-tight">{activity.address}</span>
            </div>
            <a 
              href={activity.naverMapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#03C75A] text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-[#02b351] transition-colors flex-shrink-0"
            >
              <span className="bg-white text-[#03C75A] w-3 h-3 rounded-full flex items-center justify-center font-bold text-[8px]">N</span>
              네이버 지도 보기
            </a>
          </div>
        </div>
      )}

      <p className="text-slate-600 leading-relaxed text-sm">{activity.description}</p>
    </div>
  );
};

const ItineraryCard: React.FC<Props> = ({ plan }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8 transition-all hover:shadow-xl hover:border-blue-100 group/card">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-md text-white font-black rounded-2xl px-4 py-1.5 text-sm border border-white/30">
            DAY {plan.day}
          </div>
          <h3 className="text-white font-bold text-xl tracking-tight">{plan.theme}</h3>
        </div>
        <i className="fa-solid fa-map text-white/30 text-2xl"></i>
      </div>
      
      <div className="p-8">
        <div className="space-y-8 relative before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
          {plan.activities.map((activity, idx) => (
            <ActivityItem key={idx} activity={activity} />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 hover:bg-amber-100/50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-amber-200 rounded-lg flex items-center justify-center text-amber-700">
                <i className="fa-solid fa-star text-xs"></i>
              </div>
              <span className="font-black text-amber-900 text-xs uppercase tracking-wider">로컬 시크릿</span>
            </div>
            <p className="text-sm text-amber-800/80 leading-snug font-medium">{plan.localTip}</p>
          </div>

          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 hover:bg-emerald-100/50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-emerald-200 rounded-lg flex items-center justify-center text-emerald-700">
                <i className="fa-solid fa-compass text-xs"></i>
              </div>
              <span className="font-black text-emerald-900 text-xs uppercase tracking-wider">동선 최적화</span>
            </div>
            <p className="text-sm text-emerald-800/80 leading-snug font-medium">{plan.efficiencyNote}</p>
          </div>

          <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100 hover:bg-sky-100/50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-sky-200 rounded-lg flex items-center justify-center text-sky-700">
                <i className="fa-solid fa-umbrella text-xs"></i>
              </div>
              <span className="font-black text-sky-900 text-xs uppercase tracking-wider">비 올 때 대안</span>
            </div>
            <p className="text-sm text-sky-800/80 leading-snug font-medium">{plan.indoorAlternative}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;
