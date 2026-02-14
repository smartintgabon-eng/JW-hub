// src/services/apiService.ts

import { AppSettings, PredicationType, StudyPart } from "../types";

export const callGenerateContentApi = async (
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION',
  input: string,
  part: StudyPart = 'tout',
  settings: AppSettings,
  isInitialSearchForPreview: boolean = false,
  preachingType: PredicationType | undefined
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
