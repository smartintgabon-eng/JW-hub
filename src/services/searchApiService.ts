// src/services/searchApiService.ts
import { AppSettings, GeneratedStudy } from '../types';

export const callSearchContentApi = async (
  questionOrSubject: string,
  settings: AppSettings,
  isInitialSearchForPreview: boolean = false, // Potentially for future use if needed
): Promise<{ 
    text: string; 
    title: string; 
    theme?: string; 
    rawSources: GeneratedStudy['rawSources']; 
    aiExplanation: string 
}> => {

  const response = await fetch('/api/search-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionOrSubject,
      settings,
      isInitialSearchForPreview,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};