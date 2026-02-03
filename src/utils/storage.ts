
import { GeneratedStudy, AppSettings } from "./types"; 

const HISTORY_KEY = 'jw_study_history';
const SETTINGS_KEY = 'jw_study_settings';

export const saveToHistory = (study: GeneratedStudy) => {
  const history = getHistory();
  const newHistory = [study, ...history].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const getHistory = (): GeneratedStudy[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteFromHistory = (id: string) => {
  const history = getHistory();
  const newHistory = history.filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const resetSettings = () => {
  localStorage.removeItem(SETTINGS_KEY);
};

/**
 * Réinitialisation totale : supprime tout le stockage local, 
 * vide tous les caches du navigateur et désenregistre les Service Workers.
 */
export const totalReset = async () => {
  // 1. Nettoyage du stockage synchrone
  localStorage.clear();
  sessionStorage.clear();

  // 2. Nettoyage du Cache API (fichiers mis en cache par le Service Worker)
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      console.log('Caches supprimés.');
    } catch (e) {
      console.error('Erreur lors de la suppression des caches:', e);
    }
  }

  // 3. Désenregistrement du Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('Service Workers désenregistrés.');
    } catch (e) {
      console.error('Erreur lors du désenregistrement du SW:', e);
    }
  }

  // 4. Rechargement forcé de la page pour repartir de zéro
  window.location.reload();
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  const defaultSettings: AppSettings = {
    backgroundColor: '#09090b',
    customHex: '',
    buttonColor: '#4a70b5',
    customButtonHex: '',
    autoSave: true,
    modelName: 'gemini-3-flash-preview',
    answerPreferences: ''
  };
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
};