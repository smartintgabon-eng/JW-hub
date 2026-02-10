// src/utils/storage.ts

import { AppSettings, GeneratedStudy, AppView } from '../types';

const SETTINGS_KEY = 'jw_study_pro_settings';
const HISTORY_KEY = 'jw_study_pro_history';

// Default settings
const defaultSettings: AppSettings = {
  backgroundColor: '#09090b',
  customHex: '',
  buttonColor: '#4a70b5',
  customButtonHex: '',
  autoSave: true, // Assuming default is true
  modelName: 'gemini-3-flash-preview', // Default model name
  answerPreferences: 'Précis, factuel, fidèle aux enseignements bibliques et détaillé.',
};

export const getSettings = (): AppSettings => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
  } catch (error) {
    console.error("Error getting settings from localStorage:", error);
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings to localStorage:", error);
  }
};

export const getHistory = (): GeneratedStudy[] => {
  try {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error("Error getting history from localStorage:", error);
    return [];
  }
};

export const saveToHistory = (study: GeneratedStudy) => {
  try {
    const history = getHistory();
    // Check if the study already exists and update it, otherwise add new
    const existingIndex = history.findIndex(s => s.id === study.id);
    if (existingIndex > -1) {
      history[existingIndex] = study;
    } else {
      history.unshift(study); // Add new study to the beginning
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving to history in localStorage:", error);
  }
};

export const deleteFromHistory = (id: string) => {
  try {
    let history = getHistory();
    history = history.filter(study => study.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error deleting from history in localStorage:", error);
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing history from localStorage:", error);
  }
};

export const totalReset = async () => {
  try {
    localStorage.clear();
    // Clear service worker caches if supported
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
    // Unregister service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    alert("Application réinitialisée avec succès ! La page va maintenant se recharger.");
    window.location.reload();
  } catch (error) {
    console.error("Error during total reset:", error);
    alert("Erreur lors de la réinitialisation totale. Veuillez réessayer.");
  }
};