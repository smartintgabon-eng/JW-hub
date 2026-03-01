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
  RECHERCHES = 'RECHERCHES',
  PREFERENCE_MANAGER = 'PREFERENCE_MANAGER',
  DISCOURS = 'DISCOURS'
}

export type DiscoursType = 'normal' | 'jeudi' | 'dimanche' | 'special';

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

export interface ContentOptions {
  includeArticles: boolean;
  includeImages: boolean;
  includeVideos: boolean;
  includeVerses: boolean; 
  articleLinks?: string[]; 
}

export type HistoryCategory = 
  | 'cahier_vie_et_ministere'
  | 'tour_de_garde'
  | 'predication_porte_en_porte'
  | 'predication_nouvelle_visite'
  | 'predication_cours_biblique'
  | 'recherches'
  | 'discours_normal'
  | 'discours_jeudi'
  | 'discours_dimanche'
  | 'discours_special';

export interface GeneratedStudy {
  id: string;
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION' | 'RECHERCHES' | 'DISCOURS';
  category: HistoryCategory;
  title: string;
  date: string;
  url?: string | string[];
  content: string;
  timestamp: number;
  // Optional fields preserved for compatibility
  part?: StudyPart;
  preachingType?: PredicationType;
  rawSources?: { title: string; uri: string; content: string }[];
  aiExplanation?: string;
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