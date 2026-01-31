
export enum AppView {
  HOME = 'HOME',
  MINISTRY = 'MINISTRY',
  WATCHTOWER = 'WATCHTOWER',
  TUTORIAL = 'TUTORIAL',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}

export type StudyPart = 
  | 'perles' 
  | 'joyaux' 
  | 'ministere' 
  | 'vie_chretienne' 
  | 'etude_biblique' 
  | 'tout';

export interface GeneratedStudy {
  id: string;
  type: 'WATCHTOWER' | 'MINISTRY';
  title: string;
  date: string;
  url?: string;
  content: string;
  timestamp: number;
}

export interface AppSettings {
  backgroundColor: string;
  customHex: string;
  autoSave: boolean;
  modelName: string;
}
