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
  extraParams?: Record<string, any> // Allow passing extra parameters
): Promise<{ text: string; title: string; theme?: string; rawSources?: GeneratedStudy['rawSources']; aiExplanation?: string }> => {

  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      input,
      part,
      settings,
      isInitialSearchForPreview,
      preachingType,
      contentOptions,
      articleReferences: contentOptions?.articleLinks,
      ...extraParams // Spread extra params into the body
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};