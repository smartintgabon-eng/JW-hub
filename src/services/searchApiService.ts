// src/services/searchApiService.ts
import { AppSettings } from '../types';

export const callSearchContentApi = async (
  questionOrSubject: string,
  settings: AppSettings,
  confirmMode: boolean,
  contentOptions?: any
): Promise<{ 
    text?: string; 
    previewTitle?: string;
    previewSummary?: string;
    previewImage?: string;
    previewInfos?: string; 
}> => {

  const response = await fetch('/api/search-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionOrSubject,
      settings,
      confirmMode,
      contentOptions,
    }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Erreur serveur: ${response.status} - Réponse non-JSON reçue.`);
    }
    throw new Error(errorData.message || `Erreur API: ${response.status}`);
  }

  return response.json();
};
