export enum DiscourseType {
  NORMAL = 'normal',
  THURSDAY = 'thursday',
  SUNDAY = 'sunday',
  SPECIAL = 'special',
}

export enum DiscourseTimeOptions {
  FIVE_MIN = '5min',
  TEN_MIN = '10min',
  THIRTY_MIN = '30min',
  FORTY_MIN = '40min',
  ONE_HOUR = '1h',
  ONE_MIN = '1min',
  FOUR_MIN = '4min',
  FIFTEEN_MIN = '15min',
}

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
  | 'recherches'
  | 'discours_normal'
  | 'discours_jeudi'
  | 'discours_dimanche'
  | 'discours_special';

export interface GeneratedStudy {
  id: string;
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION' | 'RECHERCHES' | 'DISCOURS';
  title: string;
  date: string;
  url?: string | string[];
  content: string;
  timestamp: number;
  part?: StudyPart;
  preachingType?: PredicationType;
  category: HistoryCategory;
  rawSources?: { title: string; uri: string; content: string }[];
  aiExplanation?: string;
}

export interface GeneratedDiscourse extends GeneratedStudy {
  discoursType: DiscourseType;
  time: string;
  theme: string;
  articleReferences?: string[];
  imageReferences?: string[];
  videoReferences?: string[];
  pointsToReinforce?: string[];
  strengths?: string[];
  encouragements?: string;
  settings: AppSettings;
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
