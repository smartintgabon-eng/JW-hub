// src/services/apiService.ts
import { StudyPart, PredicationType, AppSettings, GeneratedStudy } from '../types'; // Import GeneratedStudy type

export const callGenerateContentApi = async (
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION',
  input: string | string[], // Modified to accept string or string[]
  part: StudyPart = 'tout',
  settings: AppSettings,
  isInitialSearchForPreview: boolean = false,
  preachingType: PredicationType | undefined
): Promise<{ text: string; title: string; theme?: string; rawSources?: GeneratedStudy['rawSources']; aiExplanation?: string }> => { // Added optional rawSources and aiExplanation

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
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};