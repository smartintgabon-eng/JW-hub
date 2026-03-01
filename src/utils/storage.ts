import { GeneratedStudy, HistoryCategory } from '../types';

const STORAGE_KEY = 'jw_study_history';

export const saveStudy = (study: GeneratedStudy): void => {
  try {
    const history = getHistory();
    const newHistory = [study, ...history].slice(0, 50); // Garder les 50 derniers
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
  }
};

export const getHistory = (): GeneratedStudy[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'historique:', error);
    return [];
  }
};

export const getHistoryByCategory = (category: HistoryCategory): GeneratedStudy[] => {
  return getHistory().filter(item => item.category === category);
};

export const deleteStudy = (id: string): void => {
  try {
    const history = getHistory();
    const newHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveSettings = (settings: any) => {
  localStorage.setItem('jw_settings', JSON.stringify(settings));
};

export const totalReset = () => {
  localStorage.clear();
};

export const deleteFromHistory = (id: string) => {
  const history = JSON.parse(localStorage.getItem('jw_history') || '[]');
  const newHistory = history.filter((h: any) => h.id !== id);
  localStorage.setItem('jw_history', JSON.stringify(newHistory));
};

export const saveInputState = (key: string, data: any) => {
  localStorage.setItem(`input_${key}`, JSON.stringify(data));
};

export const loadInputState = (key: string, defaultValue: any = null) => {
  const data = localStorage.getItem(`input_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

export const clearHistoryOnly = () => {
  localStorage.removeItem('jw_history');
  localStorage.removeItem('jw_study_history');
};
