// src/services/searchApiService.ts
import { AppSettings, GeneratedStudy } from '../types';
import { ContentOptions } from '../components/ContentInclusion';

export const callSearchContentApi = async (
  questionOrSubject: string,
  settings: AppSettings,
  // Fix: Add confirmMode parameter
  confirmMode: boolean, 
  contentOptions?: ContentOptions
): Promise<{ 
    text: string; 
    title: string; 
    theme?: string; 
    rawSources?: GeneratedStudy['rawSources']; 
    aiExplanation?: string;
    previewTitle?: string;
    previewSummary?: string;
    previewImage?: string;
    previewInfos?: string; // Added for "Infos clés"
}> => {

  const response = await fetch('/api/search-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionOrSubject,
      settings,
      // Fix: Pass confirmMode in the request body
      confirmMode, 
      contentOptions,
      articleReferences: contentOptions?.articleLinks
    }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // If response.json() fails, it means the server didn't send JSON (e.g., HTML error page)
      throw new Error(`Server Error: ${response.status} - Non-JSON response received.`);
    }
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
};