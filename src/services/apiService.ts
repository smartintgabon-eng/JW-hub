// src/services/apiService.ts
import { AppSettings, PredicationType } from '../types';

export const callGenerateContentApi = async (
  type: 'WATCHTOWER' | 'MINISTRY' | 'DISCOURS' | 'DISCOURS_THEME' | 'PREDICATION',
  input: string | string[],
  part: string,
  settings: AppSettings,
  useManual: boolean,
  preachingType?: PredicationType,
  contentOptions?: any // This will be ignored by the new API, but kept for compatibility
): Promise<{ text: string; title: string; theme?: string }> => {

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
      manualText: useManual ? input : undefined, // Pass input as manualText if useManual is true
      preachingType,
      // contentOptions are no longer directly used by the new API, as it handles grounding internally
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
