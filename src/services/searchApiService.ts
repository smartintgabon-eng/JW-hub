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

    const data = await response.json();
    
    // Si on avait un callback de stream, on l'appelle une fois avec le texte complet pour la compatibilité UI
    if (onStream && data.text) {
      onStream(data.text);
    }

    if (confirmMode) {
      return data;
    }

    return { 
      text: data.text || "", 
      title: data.title || questionOrSubject,
      theme: data.theme,
      rawSources: data.rawSources,
      aiExplanation: data.aiExplanation || data.text
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("TIMEOUT: La recherche a dépassé 30 secondes et a été annulée.");
    }
    throw err;
  }
};
