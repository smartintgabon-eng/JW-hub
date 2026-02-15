// src/utils/storage.ts

// Définitions de types locales, car types.ts est marqué pour suppression
export enum AppView {
  HOME = 'HOME',
  MINISTRY = 'MINISTRY',
  WATCHTOWER = 'WATCHTOWER',
  PREDICATION = 'PREDICATION', 
  TUTORIAL = 'TUTORIAL',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  UPDATES = 'UPDATES' 
}

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

export type HistoryCategory = 
  | 'cahier_vie_et_ministere'
  | 'tour_de_garde'
  | 'predication_porte_en_porte'
  | 'predication_nouvelle_visite'
  | 'predication_cours_biblique';

export interface GeneratedStudy {
  id: string;
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION'; 
  title: string;
  date: string;
  url?: string;
  content: string;
  timestamp: number;
  part?: StudyPart; 
  preachingType?: PredicationType; 
  category: HistoryCategory; 
}

export interface AppSettings {
  backgroundColor: string;
  customHex: string;
  buttonColor: string;
  customButtonHex: string;
  autoSave: boolean;
  modelName: string;
  answerPreferences: string;
}


const SETTINGS_KEY = 'jw_study_pro_settings';
const HISTORY_KEY = 'jw_study_pro_history';

// Default settings
const defaultSettings: AppSettings = {
  backgroundColor: '#09090b',
  customHex: '',
  buttonColor: '#4a70b5',
  customButtonHex: '',
  autoSave: true, 
  modelName: 'gemini-2.5-flash', 
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
    const history: GeneratedStudy[] = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Migration de données si nécessaire pour ajouter 'category' aux anciennes études
    return history.map(study => {
      if (!study.category) {
        if (study.type === 'WATCHTOWER') {
          study.category = 'tour_de_garde';
        } else if (study.type === 'MINISTRY') {
          study.category = 'cahier_vie_et_ministere';
        } else if (study.type === 'PREDICATION' && study.preachingType) {
          study.category = `predication_${study.preachingType}` as HistoryCategory;
        } else {
          study.category = 'cahier_vie_et_ministere'; // Default fallback
        }
      }
      // Ensure type is PREDICATION for preachingType to be valid for old data
      if (study.preachingType && study.type !== 'PREDICATION') {
        study.type = 'PREDICATION';
      }
      return study;
    });

  } catch (error) {
    console.error("Error getting history from localStorage:", error);
    return [];
  }
};

export const saveToHistory = (study: GeneratedStudy) => {
  try {
    const history = getHistory(); // Get history with potential migration
    
    // Ensure category is set before saving
    if (!study.category) {
        if (study.type === 'WATCHTOWER') {
            study.category = 'tour_de_garde';
        } else if (study.type === 'MINISTRY') {
            study.category = 'cahier_vie_et_ministere';
        } else if (study.type === 'PREDICATION' && study.preachingType) {
            study.category = `predication_${study.preachingType}` as HistoryCategory;
        } else {
            study.category = 'cahier_vie_et_ministere'; // Fallback
        }
    }

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