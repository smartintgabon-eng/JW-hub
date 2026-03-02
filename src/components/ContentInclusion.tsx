import React from 'react';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import { ContentOptions } from '../types.ts';

interface Props {
  options: ContentOptions;
  onChange: (options: ContentOptions) => void;
}

const ContentInclusion: React.FC<Props> = ({ options, onChange }) => {
  const [newLink, setNewLink] = React.useState('');

  const toggleOption = (key: keyof Omit<ContentOptions, 'articleLinks'>) => {
    onChange({ ...options, [key]: !options[key] });
  };

  const addLink = () => {
    if (newLink.trim() && newLink.startsWith('http')) {
      onChange({ ...options, articleLinks: [...(options.articleLinks || []), newLink.trim()] });
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    const newLinks = [...(options.articleLinks || [])];
    newLinks.splice(index, 1);
    onChange({ ...options, articleLinks: newLinks });
  };

  return (
    <div className="mb-8 p-6 bg-black/20 border border-white/5 rounded-2xl space-y-6">
      <div>
        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-4 block">Inclure du contenu (Optionnel)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'includeArticles', label: 'Articles' },
            { id: 'includeImages', label: 'Images' },
            { id: 'includeVideos', label: 'Vidéos' },
            { id: 'includeVerses', label: 'Versets' },
          ].map((opt) => (
            <div 
              key={opt.id}
              onClick={() => toggleOption(opt.id as any)}
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${options[opt.id as keyof ContentOptions] ? 'bg-[var(--btn-color)]/20 border-[var(--btn-color)] text-[var(--btn-color)]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
            >
              <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${options[opt.id as keyof ContentOptions] ? 'bg-[var(--btn-color)] border-[var(--btn-color)]' : 'border-white/30'}`}>
                {options[opt.id as keyof ContentOptions] && <span className="text-[var(--btn-text)] text-[10px] font-bold">✓</span>}
              </div>
              <span className="text-xs font-bold uppercase">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase opacity-40 tracking-widest block">Liens d&apos;articles à utiliser (Optionnel)</label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
              placeholder="https://www.jw.org/..."
              className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)] transition-all text-sm"
            />
          </div>
          <button 
            onClick={addLink}
            disabled={!newLink.trim().startsWith('http')}
            className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-xl transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        {(options.articleLinks || []).length > 0 && (
          <div className="space-y-2 mt-4">
            {(options.articleLinks || []).map((link, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl animate-in fade-in slide-in-from-left-2">
                <span className="text-xs truncate flex-1 opacity-80">{link}</span>
                <button onClick={() => removeLink(idx)} className="p-1 text-red-400 hover:bg-red-400/20 rounded-lg transition-all ml-2">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentInclusion;
