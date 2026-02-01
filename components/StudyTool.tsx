
import React, { useState } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { StudyPart, GeneratedStudy, AppSettings } from '../types';
import { generateStudyContent } from '../services/geminiService';

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
}

const StudyTool: React.FC<Props> = ({ type, onGenerated, settings }) => {
  const [input, setInput] = useState('');
  const [selectedPart, setSelectedPart] = useState<StudyPart>('tout');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{title: string, content: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (isRetry = false) => {
    if (!input) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateStudyContent(type, input, selectedPart);
      if (!isRetry && type === 'WATCHTOWER' && !preview) {
        setPreview({ title: result.title, content: result.text });
      } else {
        const newStudy: GeneratedStudy = {
          id: Date.now().toString(),
          type,
          title: result.title,
          date: new Date().toLocaleDateString('fr-FR'),
          url: input.startsWith('http') ? input : undefined,
          content: result.text,
          timestamp: Date.now()
        };
        onGenerated(newStudy);
        setPreview(null);
        setInput('');
      }
    } catch (err: any) {
      setError(err.message || "Erreur de génération.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-5 mb-6">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-[1.5rem] shadow-xl">
          {type === 'WATCHTOWER' ? <Calendar size={32} /> : <Search size={32} />}
        </div>
        <div>
          <h2 className="text-3xl font-black">{type === 'WATCHTOWER' ? 'La Tour de Garde' : 'Vie et Ministère'}</h2>
          <p className="opacity-60 font-bold">Lien jw.org ou thème de l'étude.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 space-y-8 shadow-2xl">
        <div className="space-y-3">
          <label className="text-xs font-black opacity-40 uppercase tracking-widest ml-2">Source JW.ORG</label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={type === 'WATCHTOWER' ? "Lien de la Tour de Garde..." : "Lien du Cahier..."}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:border-white/40 transition-all font-medium"
            />
            <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" size={24} />
          </div>
        </div>

        {type === 'MINISTRY' && (
          <div className="space-y-4">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'tout', label: 'Tout' },
                { id: 'joyaux', label: 'Joyaux' },
                { id: 'perles', label: 'Perles' },
                { id: 'ministere', label: 'Ministère' },
                { id: 'vie_chretienne', label: 'Vie Chrétienne' },
                { id: 'etude_biblique', label: 'Étude' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPart(p.id as StudyPart)}
                  style={{ 
                    backgroundColor: selectedPart === p.id ? 'var(--btn-color)' : 'rgba(255,255,255,0.05)',
                    color: selectedPart === p.id ? 'var(--btn-text)' : 'var(--text-color)'
                  }}
                  className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => handleGenerate()}
          disabled={loading || !input}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
          className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center space-x-3 transition-all shadow-xl active:scale-95 disabled:opacity-30`}
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
          <span>{loading ? "Génération..." : "Générer l'étude"}</span>
        </button>
      </div>

      {preview && (
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 animate-in zoom-in-95 duration-500 shadow-2xl">
          <h3 className="text-2xl font-black mb-6">{preview.title}</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleGenerate(true)}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
              className="flex-1 font-black py-4 rounded-xl shadow-lg uppercase tracking-widest"
            >
              Confirmer
            </button>
            <button onClick={() => setPreview(null)} className="flex-1 bg-white/5 font-black py-4 rounded-xl border border-white/10 uppercase tracking-widest">Modifier</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTool;
