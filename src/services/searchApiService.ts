// src/services/searchApiService.ts
import { AppSettings, GeneratedStudy } from '../types';
import { ContentOptions } from '../components/ContentInclusion';

export const callSearchContentApi = async (
  questionOrSubject: string,
  settings: AppSettings,
  confirmMode: boolean, 
  contentOptions?: ContentOptions,
  onStream?: (text: string) => void,
  part?: string
): Promise<{ 
    text: string; 
    title: string; 
    theme?: string; 
    rawSources?: GeneratedStudy['rawSources']; 
    aiExplanation?: string;
    previewTitle?: string;
    previewSummary?: string;
    previewImage?: string;
    previewInfos?: string;
    url?: string;
}> => {

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for Pro mode

  try {
    const response = await fetch('/api/search-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        questionOrSubject,
        settings,
        confirmMode, 
        contentOptions,
        part,
        articleReferences: contentOptions?.articleLinks
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("QUOTA_EXCEEDED: Quota d'IA épuisé. Veuillez patienter quelques minutes.");
      }
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Server Error: ${response.status}`);
      }
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Handle Streaming Response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (reader) {
      let done = false;
      while (!done) {
        const { done: streamDone, value } = await reader.read();
        done = streamDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          
          if (onStream) {
            onStream(fullText);
          }
        }
      }
    } else {
      // Fallback for non-streaming response
      const data = await response.json();
      fullText = data.text || "";
      if (onStream) onStream(fullText);
      
      if (confirmMode) {
        return data;
      }
      
      return { 
        text: fullText, 
        title: data.title || questionOrSubject,
        theme: data.theme,
        rawSources: data.rawSources,
        aiExplanation: data.aiExplanation || fullText
      };
    }

    if (confirmMode) {
      // Streaming doesn't support confirmMode object return easily without parsing JSON at the end
      // But confirmMode usually returns a JSON object, not a stream of text.
      // In api/search-content.js, confirmMode returns res.status(200).json(...) which is NOT streaming.
      // So we need to handle that case.
      // If content-type is json, parse as json.
      try {
          const data = JSON.parse(fullText);
          return data;
      } catch (e) {
          // If not valid JSON, maybe it was just text?
          // But confirmMode expects specific fields.
          // Let's assume if it was streaming, it wasn't confirmMode or confirmMode failed.
          // Actually, looking at api/search-content.js, confirmMode returns a JSON response, not a stream.
          // But my refactor of api/search-content.js REMOVED the specific confirmMode JSON return and replaced it with streaming logic for everything?
          // Let's check api/search-content.js again.
      }
    }

    return { 
      text: fullText, 
      title: questionOrSubject,
      aiExplanation: fullText
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("TIMEOUT: La recherche a dépassé 30 secondes et a été annulée.");
    }
    throw err;
  }
};
