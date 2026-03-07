// src/services/apiService.ts
import { StudyPart, PredicationType, AppSettings, GeneratedStudy } from '../types'; // Import GeneratedStudy type
import { ContentOptions } from '../components/ContentInclusion';

export const callGenerateContentApi = async (
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION' | 'DISCOURS' | 'DISCOURS_THEME',
  input: string | string[],
  part: StudyPart = 'tout',
  settings: AppSettings,
  isInitialSearchForPreview: boolean = false,
  preachingType: PredicationType | undefined,
  contentOptions?: ContentOptions,
  extraParams?: Record<string, any>,
  onStream?: (text: string) => void
): Promise<{ text: string; title: string; theme?: string; rawSources?: GeneratedStudy['rawSources']; aiExplanation?: string }> => {

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for Pro mode

  try {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        type,
        input,
        part,
        settings,
        isInitialSearchForPreview,
        preachingType,
        contentOptions,
        articleReferences: contentOptions?.articleLinks,
        ...extraParams 
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

    if (type === 'DISCOURS_THEME') {
      return data;
    }

    return { 
      text: data.text || "", 
      title: data.title || "Generated Content",
      theme: data.theme,
      rawSources: data.rawSources,
      aiExplanation: data.aiExplanation || data.text
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("TIMEOUT: La requête a dépassé 30 secondes et a été annulée.");
    }
    throw err;
  }
};
