// src/services/apiService.ts

// Définitions de types locales, car types.ts est marqué pour suppression
export type StudyPart =
  | 'perles_spirituelles' 
  | 'joyaux_parole_dieu' 
  | 'applique_ministere' 
  | 'vie_chretienne' 
  | 'etude_biblique_assemblee' 
  | 'tout';

export type PredicationType =
  | 'porte_en_porte'
  | 'nouvelle_visite'
  | 'cours_biblique';

export interface AppSettings {
  backgroundColor: string;
  customHex: string;
  buttonColor: string;
  customButtonHex: string;
  autoSave: boolean;
  modelName: string;
  answerPreferences: string;
}


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