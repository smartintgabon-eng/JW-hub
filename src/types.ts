export enum AppView {
  HOME = 'HOME',
  MINISTRY = 'MINISTRY',
  WATCHTOWER = 'WATCHTOWER',
  TUTORIAL = 'TUTORIAL',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}

export type StudyPart =
  | 'perles_spirituelles' 
  | 'joyaux_parole_dieu' 
  | 'applique_ministere' 
  | 'vie_chretienne' 
  | 'etude_biblique_assemblee' 
  | 'tout';

// Moved from StudyTool.tsx to be shared with History.tsx
export const studyPartOptions: { value: StudyPart; label: string }[] = [
  { value: 'joyaux_parole_dieu', label: 'Joyaux de la Parole de Dieu' },
  { value: 'perles_spirituelles', label: 'Perles Spirituelles' },
  { value: 'applique_ministere', label: 'Applique-toi au Ministère' },
  { value: 'vie_chretienne', label: 'Vie Chrétienne' },
  { value: 'etude_biblique_assemblee', label: 'Étude Biblique de l\'Assemblée' },
  { value: 'tout', label: 'Toutes les parties' },
];

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