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
