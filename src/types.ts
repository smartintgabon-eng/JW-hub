
export enum AppView {
  HOME = 'HOME',
  MINISTRY = 'MINISTRY',
  WATCHTOWER = 'WATCHTOWER',
  TUTORIAL = 'TUTORIAL',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  UPDATES = 'UPDATES' // New view for updates
}

export type StudyPart =
  | 'perles_spirituelles' 
  | 'joyaux_parole_dieu' 
  | 'applique_ministere' 
  | 'vie_chretienne' 
  | 'etude_biblique_assemblee' 
  | 'tout';

// studyPartOptions a été déplacé dans src/components/StudyTool.tsx pour être local à son utilisation.

export interface GeneratedStudy {
  id: string;
  type: 'WATCHTOWER' | 'MINISTRY';
  title: string;
  date: string;
  url?: string;
  content: string;
  timestamp: number;
  part?: StudyPart; // Nouvelle propriété pour stocker la partie d'étude demandée
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