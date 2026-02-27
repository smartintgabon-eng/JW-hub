import React from 'react';
import { AppSettings } from '../types';
import StudyTool from './StudyTool.tsx';
import { Home } from 'lucide-react';

interface PredicationToolProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const PredicationTool: React.FC<PredicationToolProps> = ({ settings, setGlobalLoadingMessage }) => {
  return (
    <StudyTool 
      category="predication_porte_en_porte" 
      title="Prédication" 
      icon={<Home size={32} />} 
      settings={settings} 
      setGlobalLoadingMessage={setGlobalLoadingMessage}
      showPredicationTypes={true}
      placeholderTheme="Sujet de conversation ou situation..."
    />
  );
};

export default PredicationTool;
