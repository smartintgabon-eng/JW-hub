
import { GeneratedStudy, AppSettings } from "../types";

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

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  const defaultSettings: AppSettings = {
    backgroundColor: '#09090b',
    customHex: '',
    buttonColor: '#4a70b5',
    customButtonHex: '',
    autoSave: true,
    modelName: 'gemini-3-pro-preview',
    answerPreferences: ''
  };
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
};
