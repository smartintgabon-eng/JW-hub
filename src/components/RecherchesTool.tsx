import React from 'react';
import { AppSettings } from '../types';
import StudyTool from './StudyTool.tsx';
import { Search } from 'lucide-react';

interface RecherchesToolProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const RecherchesTool: React.FC<RecherchesToolProps> = ({ settings, setGlobalLoadingMessage }) => {
  return (
    <StudyTool 
      category="recherches" 
      title="Recherches Avancées" 
      icon={<Search size={32} />} 
      settings={settings} 
      setGlobalLoadingMessage={setGlobalLoadingMessage}
      placeholderTheme="Posez une question biblique ou un sujet de recherche..."
    />
  );
};

export default RecherchesTool;
