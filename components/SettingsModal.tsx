
import React, { useState, useEffect } from 'react';
import { testApiConnection } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [manualKey, setManualKey] = useState<string>('');
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('TRAVEL_BUDDY_USER_KEY');
      if (savedKey) setManualKey(savedKey);
      
      // 환경변수나 브릿지 키가 있는지 확인 (개념적 확인)
      checkGlobalKeyStatus();
    }
  }, [isOpen]);

  const checkGlobalKeyStatus = async () => {
    // aistudio 브릿지 확인
    if ((window as any).aistudio?.hasSelectedApiKey) {
      const status = await (window as any).aistudio.hasSelectedApiKey();
      setHasEnvKey(status);
    } else if (process.env.API_KEY) {
      setHasEnvKey(true);
    }
  };

  const handleSaveManualKey = () => {
    if (manualKey.trim()) {
      localStorage.setItem('TRAVEL_BUDDY_USER_KEY', manualKey.trim());
      setIsSaved(true);
      setTestStatus('idle');
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      localStorage.removeItem('TRAVEL_BUDDY_USER_KEY');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSelectKeyFromDialog = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      await checkGlobalKeyStatus();
      setTestStatus('idle');
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    const isOk = await testApiConnection();
    setTestStatus(isOk ? 'success' : 'fail');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">서비스 설정</h2>
              <p className="text-xs font-bold text-slate-400">API 연결 및 품질을 관리합니다.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <i className="fa-solid fa-xmark text-slate-400"></i>
            </button>
          </div>

          <div className="space-y-6">
            {/* Manual API Key Input Section */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-keyboard text-blue-500"></i>
                <span className="font-black text-sm text-slate-700">API 키 직접 입력</span>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="password"
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                  />
                  {manualKey && (
                    <button 
                      onClick={() => setManualKey('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                    >
                      <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={handleSaveManualKey}
                  className={`w-full py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isSaved ? (
                    <><i className="fa-solid fa-check"></i> 저장 완료</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk"></i> 키 저장하기</>
                  )}
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <p className="text-[10px] text-slate-400 font-bold mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  또는 공식 대화상자 사용
                </p>
                <button 
                  onClick={handleSelectKeyFromDialog}
                  className="w-full py-3 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 text-slate-600 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-up-right-from-square text-[10px]"></i>
                  Google AI Studio에서 키 선택
                </button>
              </div>
            </div>

            {/* Test Section */}
            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-plug-circle-bolt text-indigo-500"></i>
                  <span className="font-black text-sm text-slate-700">연결 테스트</span>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${hasEnvKey || manualKey ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                  {manualKey ? '수동 키 사용 중' : hasEnvKey ? '기본 키 감지됨' : '키 없음'}
                </div>
              </div>

              <button 
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testStatus === 'testing' ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-vial"></i>
                )}
                연결 상태 확인
              </button>

              {testStatus === 'success' && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-start gap-2.5 text-emerald-700 font-bold text-xs animate-in slide-in-from-top-1 border border-emerald-100">
                  <i className="fa-solid fa-circle-check mt-0.5"></i>
                  <span>성공! AI 엔진이 활성화되었습니다. 이제 여행 일정을 생성해 보세요.</span>
                </div>
              )}
              {testStatus === 'fail' && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl flex items-start gap-2.5 text-red-700 font-bold text-xs animate-in slide-in-from-top-1 border border-red-100">
                  <i className="fa-solid fa-circle-xmark mt-0.5"></i>
                  <span>연결 실패. 입력한 키가 정확한지, 결제가 활성화된 프로젝트인지 확인해 주세요.</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">Travel Buddy AI Engine v3.1</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
