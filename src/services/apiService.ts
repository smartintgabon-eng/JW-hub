import { AppSettings } from '../types';

interface GenerateContentParams {
  type: string;
  input: string;
  settings: AppSettings;
  mode?: 'link' | 'theme';
  rawInput?: string;
}

export const generateContent = async (params: GenerateContentParams) => {
  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la génération du contenu');
  }

  return response.json();
};
