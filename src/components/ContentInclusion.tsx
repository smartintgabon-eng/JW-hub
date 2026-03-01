import React from 'react';
import { FileText, Image as ImageIcon, Video } from 'lucide-react';

export interface ContentOptions {
  includeArticles: boolean;
  includeImages: boolean;
  includeVideos: boolean;
}

interface Props {
  options: ContentOptions;
  onChange: (options: ContentOptions) => void;
}

const ContentInclusion: React.FC<Props> = ({ options, onChange }) => {
  const toggle = (key: keyof ContentOptions) => {
    onChange({ ...options, [key]: !options[key] });
  };

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <button 
        onClick={() => toggle('includeArticles')} 
        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${options.includeArticles ? 'border-[var(--btn-color)] bg-[var(--btn-color)]/10 text-white' : 'border-white/5 text-gray-500'}`}
      >
        <FileText size={20} /> <span className="text-[10px] font-bold uppercase">Articles</span>
      </button>
      <button 
        onClick={() => toggle('includeImages')} 
        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${options.includeImages ? 'border-[var(--btn-color)] bg-[var(--btn-color)]/10 text-white' : 'border-white/5 text-gray-500'}`}
      >
        <ImageIcon size={20} /> <span className="text-[10px] font-bold uppercase">Images</span>
      </button>
      <button 
        onClick={() => toggle('includeVideos')} 
        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${options.includeVideos ? 'border-[var(--btn-color)] bg-[var(--btn-color)]/10 text-white' : 'border-white/5 text-gray-500'}`}
      >
        <Video size={20} /> <span className="text-[10px] font-bold uppercase">Vidéos</span>
      </button>
    </div>
  );
};

export default ContentInclusion;
