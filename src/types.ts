
export enum AppView {
  HOME = 'HOME',
  MINISTRY = 'MINISTRY',
  WATCHTOWER = 'WATCHTOWER',
  PREDICATION = 'PREDICATION', // New view for Predication
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
  type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION'; // Added PREDICATION type
  title: string;
  date: string;
  url?: string;
  content: string;
  timestamp: number;
  part?: StudyPart; // Pour Cahier Vie et Ministère
  preachingType?: PredicationType; // Pour Prédication
  category: HistoryCategory; // Nouvelle propriété pour la catégorisation
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