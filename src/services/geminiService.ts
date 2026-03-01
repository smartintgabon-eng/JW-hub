import { AppSettings } from '../types';

export const callGemini = async (prompt: string, settings: AppSettings) => {
  try {
    const response = await fetch('/api/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'CUSTOM',
        prompt: prompt,
        settings: settings
      }),
    });
    if (!response.ok) throw new Error('Erreur API Gemini');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur IA:", error);
    throw error;
  }
};
