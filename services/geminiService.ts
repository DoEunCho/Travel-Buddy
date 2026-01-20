
import { GoogleGenAI, Type } from "@google/genai";
import { TravelInputs, ItineraryResponse, GroundingSource } from "../types";

// API 호출 직전에 인스턴스를 생성하는 헬퍼 함수
const getAiInstance = () => {
  // 사용자가 수동으로 입력한 키가 있는지 먼저 확인합니다.
  const userKey = localStorage.getItem('TRAVEL_BUDDY_USER_KEY');
  const apiKey = userKey || process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const testApiConnection = async (): Promise<boolean> => {
  try {
    const ai = getAiInstance();
    // 간단한 응답으로 키 유효성 확인
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "API Connection Test. Reply 'OK' only.",
      config: { maxOutputTokens: 5 }
    });
    return !!response.text;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const generateItinerary = async (inputs: TravelInputs): Promise<ItineraryResponse> => {
  const ai = getAiInstance();

  const prompt = `당신은 지능형 여행 일정 생성기 '트래블 버디'입니다. 
다음 목적지와 조건에 맞는 완벽한 여행 계획을 JSON 형식으로 작성해 주세요. 
반드시 구글 검색 도구를 사용하여 해당 지역의 현재 날씨와 최신 축제 정보를 확인하세요.

- 목적지: ${inputs.destination}
- 기간: ${inputs.days}일
- 선호 스타일: ${inputs.style}

[필수 데이터 요구사항]
1. realTimeHighlights: 현재 기온, 날씨 상태, 오늘 기준 진행 중인 축제나 이벤트를 반드시 포함하세요.
2. activities: 각 장소의 정확한 '도로명 주소'와 '네이버 지도 URL'을 검색해서 넣으세요.
3. packingItems: 현재 현지 날씨에 꼭 필요한 아이템 3가지를 선정하세요.
4. 모든 비용은 원화(KRW) 기준 정수로 작성하세요.
5. 응답은 반드시 한국어로 작성되어야 합니다.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            duration: { type: Type.STRING },
            packingItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            realTimeHighlights: { type: Type.STRING },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING, enum: ['오전', '오후', '저녁'] },
                        place: { type: Type.STRING },
                        description: { type: Type.STRING },
                        transportInfo: { type: Type.STRING },
                        address: { type: Type.STRING },
                        naverMapUrl: { type: Type.STRING }
                      },
                      required: ["time", "place", "description", "transportInfo", "address", "naverMapUrl"]
                    }
                  },
                  localTip: { type: Type.STRING },
                  efficiencyNote: { type: Type.STRING },
                  indoorAlternative: { type: Type.STRING }
                },
                required: ["day", "theme", "activities", "localTip", "efficiencyNote", "indoorAlternative"]
              }
            },
            estimatedCosts: {
              type: Type.OBJECT,
              properties: {
                food: { type: Type.NUMBER },
                transport: { type: Type.NUMBER },
                activities: { type: Type.NUMBER },
                accommodation: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
                currency: { type: Type.STRING }
              },
              required: ["food", "transport", "activities", "accommodation", "total", "currency"]
            }
          },
          required: ["destination", "duration", "itinerary", "estimatedCosts", "packingItems", "realTimeHighlights"]
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("API로부터 응답 텍스트를 받지 못했습니다.");
    
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedJson) as ItineraryResponse;

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      const sources: GroundingSource[] = chunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || "참고 웹사이트",
          uri: chunk.web.uri
        }));
      
      result.sources = Array.from(new Set(sources.map(s => s.uri)))
        .map(uri => sources.find(s => s.uri === uri)!);
    }

    return result;
  } catch (error) {
    console.error("Gemini API Error Detail:", error);
    throw error;
  }
};
