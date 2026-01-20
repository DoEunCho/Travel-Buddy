
import React, { useState } from 'react';
import { generateItinerary } from './services/geminiService';
import { TravelInputs, ItineraryResponse } from './types';
import LoadingOverlay from './components/LoadingOverlay';
import ItineraryCard from './components/ItineraryCard';

const App: React.FC = () => {
  const initialInputs: TravelInputs = {
    destination: '',
    days: 3,
    style: '힐링/휴양'
  };

  const [inputs, setInputs] = useState<TravelInputs>(initialInputs);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputs.destination) return;

    setLoading(true);
    setError(null);
    try {
      const data = await generateItinerary(inputs);
      setResult(data);
      setTimeout(() => {
        const resultSection = document.getElementById('itinerary-result');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError("일정 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputs(initialInputs);
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {loading && <LoadingOverlay />}

      {/* Sticky Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <i className="fa-solid fa-map-location-dot text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 tracking-tight">
              Travel Buddy
            </h1>
          </div>
          <button 
            onClick={handleReset}
            className="text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2 group"
          >
            <i className="fa-solid fa-rotate-left group-hover:rotate-[-45deg] transition-transform"></i>
            초기화
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Form Container */}
        <section className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 mb-16 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          
          <div className="max-w-2xl mx-auto text-center mb-12 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">어디로 떠나고 싶으신가요?</h2>
            <p className="text-slate-500 text-lg font-medium">실시간 검색 기능을 통해 현지의 최신 정보를 반영한 일정을 짜드립니다.</p>
          </div>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-globe text-blue-500"></i>
                목적지
              </label>
              <div className="relative group">
                <i className="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"></i>
                <input 
                  type="text"
                  placeholder="예: 제주도, 도쿄, 파리"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                  value={inputs.destination}
                  onChange={(e) => setInputs({...inputs, destination: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-calendar text-blue-500"></i>
                기간 (Day)
              </label>
              <div className="relative group">
                <i className="fa-solid fa-calendar-check absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"></i>
                <input 
                  type="number"
                  min="1"
                  max="14"
                  required
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                  value={inputs.days}
                  onChange={(e) => setInputs({...inputs, days: parseInt(e.target.value) || 1})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <i className="fa-solid fa-compass text-blue-500"></i>
                스타일
              </label>
              <div className="relative group">
                <i className="fa-solid fa-heart absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"></i>
                <select 
                  className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none font-bold"
                  value={inputs.style}
                  onChange={(e) => setInputs({...inputs, style: e.target.value})}
                >
                  <option value="힐링/휴양">힐링/휴양</option>
                  <option value="관광/명소">관광/명소</option>
                  <option value="미식/맛집">미식/맛집</option>
                  <option value="쇼핑/도시">쇼핑/도시</option>
                  <option value="액티비티/운동">액티비티/운동</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
              </div>
            </div>

            <div className="md:col-span-3 mt-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? '실시간 데이터를 분석 중입니다...' : (
                  <>
                    <i className="fa-solid fa-bolt-lightning animate-pulse"></i>
                    AI 실시간 일정 생성
                  </>
                )}
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in zoom-in duration-300">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-circle-exclamation"></i>
              </div>
              <p className="font-bold">{error}</p>
            </div>
          )}
        </section>

        {/* Results Container */}
        {result && (
          <div id="itinerary-result" className="animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out fill-mode-forwards">
            
            {/* Real-time Info Banner */}
            {result.realTimeHighlights && (
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <i className="fa-solid fa-satellite-dish animate-pulse"></i>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">실시간 현지 브리핑</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                    "{result.realTimeHighlights}"
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8 border-b border-slate-200 pb-12">
              <div className="flex-grow">
                <div className="flex items-center gap-3 text-blue-600 font-black text-sm mb-4 uppercase tracking-[0.2em]">
                  <i className="fa-solid fa-circle-check"></i>
                  완성된 여행 브리핑
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-none mb-6">
                  {result.destination} <span className="text-slate-300 font-light ml-2">{result.duration}</span>
                </h2>
                
                {/* Packing List Section */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center mr-2">추천 준비물:</span>
                  {result.packingItems.map((item, idx) => (
                    <div key={idx} className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black border border-blue-100 flex items-center gap-2">
                      <i className="fa-solid fa-check-double text-[10px]"></i>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8 shadow-2xl shadow-slate-900/30 border border-slate-800">
                <div className="text-center sm:text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Total Estimated Budget</p>
                  <div className="flex items-baseline gap-2 justify-center sm:justify-end">
                    <span className="text-4xl font-black text-blue-400 tracking-tight">{formatPrice(result.estimatedCosts.total)}</span>
                    <span className="text-sm font-bold text-slate-500">원</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.5rem] flex items-center justify-center border border-slate-700 shadow-inner">
                  <i className="fa-solid fa-receipt text-3xl text-blue-400/80"></i>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {result.itinerary.map((day) => (
                <ItineraryCard key={day.day} plan={day} />
              ))}
            </div>

            {/* Information Sources */}
            {result.sources && result.sources.length > 0 && (
              <section className="mt-12 mb-8 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-link text-blue-400"></i>
                  정보 수집 출처
                </h4>
                <div className="flex flex-wrap gap-4">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <i className="fa-solid fa-earth-americas text-slate-300 group-hover:text-blue-400"></i>
                      {source.title.length > 25 ? source.title.substring(0, 25) + "..." : source.title}
                      <i className="fa-solid fa-arrow-up-right-from-square text-[8px] text-slate-300"></i>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Budget Analytics Card */}
            <section className="mt-12 bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-30 group-hover:opacity-50 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                    <i className="fa-solid fa-chart-line text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">지능형 예산 시뮬레이션</h3>
                    <p className="text-slate-400 font-bold text-sm">트래블 버디 AI가 분석한 {result.destination}의 최신 물가 데이터입니다.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: '숙박 시설', value: result.estimatedCosts.accommodation, icon: 'fa-bed', color: 'blue' },
                    { label: '미식 & 식생활', value: result.estimatedCosts.food, icon: 'fa-plate-wheat', color: 'orange' },
                    { label: '교통 & 이동', value: result.estimatedCosts.transport, icon: 'fa-van-shuttle', color: 'indigo' },
                    { label: '액티비티 & 티켓', value: result.estimatedCosts.activities, icon: 'fa-masks-theater', color: 'emerald' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:border-blue-100 group/stat">
                      <div className={`mb-6 w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-${item.color}-500 group-hover/stat:scale-110 transition-transform border border-slate-100`}>
                        <i className={`fa-solid ${item.icon} text-lg`}></i>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                      <p className="text-2xl font-black text-slate-800">{formatPrice(item.value)}<span className="text-sm ml-1 text-slate-400">원</span></p>
                    </div>
                  ))}
                </div>

                <div className="mt-16 pt-10 border-t border-dashed border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-6">
                    <div className="text-center md:text-left">
                      <span className="font-black text-slate-400 text-[10px] uppercase tracking-widest block mb-1">Estimated Total</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 tracking-tighter">
                          {formatPrice(result.estimatedCosts.total)}
                        </span>
                        <span className="text-xl font-black text-slate-300">KRW</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4 max-w-md">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
                      <i className="fa-solid fa-bolt-lightning"></i>
                    </div>
                    <p className="text-xs text-indigo-900/70 leading-relaxed font-bold italic">
                      "AI 분석 결과: 해당 일정은 실시간 웹 데이터와 연동되어 있으며, 현재 현지의 기상 상황과 트렌드를 모두 반영하고 있습니다."
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-20 border-t border-slate-100 mt-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-2.5 rounded-xl shadow-lg">
                <i className="fa-solid fa-paper-plane text-white text-xl"></i>
              </div>
              <div>
                <span className="font-black text-slate-900 text-xl tracking-tighter block">TRAVEL BUDDY</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Concierge Service</span>
              </div>
            </div>
            
            <div className="flex gap-6">
              {['instagram', 'facebook-f', 'x-twitter', 'youtube'].map((icon) => (
                <div key={icon} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-xl transition-all cursor-pointer border border-slate-100">
                  <i className={`fa-brands fa-${icon} text-lg`}></i>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] text-slate-400 font-bold tracking-wider">
              &copy; 2024 Travel Buddy AI Labs. All rights reserved.
            </p>
            <div className="flex gap-8">
              <span className="text-[11px] font-black text-slate-300 hover:text-blue-500 cursor-pointer transition-colors uppercase tracking-widest">Privacy</span>
              <span className="text-[11px] font-black text-slate-300 hover:text-blue-500 cursor-pointer transition-colors uppercase tracking-widest">Terms</span>
              <span className="text-[11px] font-black text-slate-300 hover:text-blue-500 cursor-pointer transition-colors uppercase tracking-widest">API Docs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
