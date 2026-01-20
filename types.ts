
export interface Activity {
  time: '오전' | '오후' | '저녁';
  place: string;
  description: string;
  transportInfo: string; // 이동 수단 및 소요 시간
  address: string; // 장소 주소
  naverMapUrl: string; // 네이버 지도 링크
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
  localTip: string;
  efficiencyNote: string;
  indoorAlternative: string; // 비 올 때 대안
}

export interface EstimatedCosts {
  food: number;
  transport: number;
  activities: number;
  accommodation: number;
  total: number;
  currency: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ItineraryResponse {
  destination: string;
  duration: string;
  itinerary: DayPlan[];
  estimatedCosts: EstimatedCosts;
  packingItems: string[]; // 추천 준비물 3가지
  realTimeHighlights?: string; // 실시간 날씨, 뉴스, 축제 정보 등
  sources?: GroundingSource[]; // 정보 출처 URL
}

export interface TravelInputs {
  destination: string;
  days: number;
  style: string;
}
