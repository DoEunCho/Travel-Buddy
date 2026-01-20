
import { GoogleGenAI, Type } from "@google/genai";
import { TravelInputs, ItineraryResponse, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateItinerary = async (inputs: TravelInputs): Promise<ItineraryResponse> => {
  const prompt = `당신은 지능형 여행 일정 생성기 '트래블 버디'입니다. 
다음 조건에 맞는 여행 계획을 JSON 형식으로 작성해주세요. 구글 검색을 통해 해당 목적지의 실시간 최신 정보(현재 날씨, 진행 중인 축제, 최근 이슈 등)를 확인하여 반영하세요.

- 목적지: ${inputs.destination}
- 기간: ${inputs.days}일
- 선호 스타일: ${inputs.style}

[필수 요구사항]
1. 실시간 정보 반영: realTimeHighlights 필드에 현재 목적지의 날씨(기온, 날씨 상태), 현재 열리고 있는 축제나 이벤트 정보를 요약해서 작성하세요.
2. 각 장소 상세 정보: 모든 활동(activities)에 대해 정확한 '도로명 주소(address)'와 '네이버 지도 링크(naverMapUrl)'를 포함하세요. 네이버 지도 링크는 실제 사용 가능한 URL이어야 합니다.
3. 날씨 변수: 비가 올 경우를 대비한 실내 활동 대안(indoorAlternative)을 매일 일정 하단에 추가하세요.
4. 로컬 팁: 현지인이 즐겨 찾는 숨은 명소나 식당을 포함하세요.
5. 준비물 안내: 현재 기상 상태를 반영하여 '꼭 챙겨야 할 아이템' 3가지를 packingItems 배열에 넣으세요.
6. 이동 수단: 각 활동 간 이동 시 추천 교통수단과 소요 시간을 transportInfo에 명시하세요.
7. 모든 텍스트는 한국어로 작성하세요.
8. 비용은 한국 원화(KRW) 기준으로 추정하세요.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

  const text = response.text;
  if (!text) throw new Error("API로부터 응답을 받지 못했습니다.");
  
  const result = JSON.parse(text) as ItineraryResponse;

  // Extract sources from grounding chunks
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
};
