// src/types.ts

export enum AppView {
  HOME = 'HOME',
  MINISTRY = 'MINISTRY',
  WATCHTOWER = 'WATCHTOWER',
  PREDICATION = 'PREDICATION', 
  TUTORIAL = 'TUTORIAL',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  UPDATES = 'UPDATES',
  RECHERCHES = 'RECHERCHES', // New view for advanced search
  PREFERENCE_MANAGER = 'PREFERENCE_MANAGER',
  DISCOURS = 'DISCOURS'
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
  | 'predication_cours_biblique'
  | 'recherches' // New category for searches
  | 'discours_normal'
  | 'discours_jeudi'
  | 'discours_dimanche'
  | 'discours_special';

export interface GeneratedStudy {
  id: string;
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION' | 'RECHERCHES' | 'DISCOURS'; // Added DISCOURS
  title: string;
  date: string;
  url?: string | string[]; // Can be a single string or an array of strings
  content: string;
  timestamp: number;
  part?: StudyPart; 
  preachingType?: PredicationType; 
  category: HistoryCategory; 
  rawSources?: { title: string; uri: string; content: string }[]; // For Recherches tab
  aiExplanation?: string; // For Recherches tab
}

export interface Preference {
  id: string;
  text: string;
}

export interface AppSettings {
  bgColor: string;
  btnColor: string;
  autoSave: boolean;
  modelName: string;
  answerPreferences: Preference[];
  language: 'fr' | 'en' | 'es'; 
}