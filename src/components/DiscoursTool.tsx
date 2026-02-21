import React, { useState, useEffect } from 'react';
import { AppSettings, GeneratedStudy } from '../types.ts';
import { saveInputState, loadInputState } from '../utils/storage.ts';
import { Mic, Search, Loader2, AlertTriangle, Check, BookOpen, Clock, Image, Video, Link as LinkIcon, Plus, Minus, ChevronRight } from 'lucide-react';

interface Props {
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

export type DiscoursType = 'normal' | 'jeudi' | 'dimanche' | 'special';
export type DiscoursTime = '5min' | '10min' | '30min' | '40min' | '1h' | 'custom';

const getLocalizedText = (settings: AppSettings, key: string) => {
  const texts: { [key: string]: { [lang: string]: string } } = {
    'selectDiscoursType': { 'fr': 'Sélectionnez le type de discours', 'en': 'Select discourse type' },
    'normalDiscours': { 'fr': 'Discours Normal', 'en': 'Normal Discourse' },
    'jeudiDiscours': { 'fr': 'Discours du Jeudi', 'en': 'Thursday Discourse' },
    'dimancheDiscours': { 'fr': 'Discours du Dimanche', 'en': 'Sunday Discourse' },
    'specialDiscours': { 'fr': 'Discours Spécial', 'en': 'Special Discourse' },
    'selectTime': { 'fr': 'Sélectionnez le temps', 'en': 'Select time' },
    'customTime': { 'fr': 'Temps personnalisé (min)', 'en': 'Custom time (min)' },
    'enterTheme': { 'fr': 'Entrez le thème du discours', 'en': 'Enter discourse theme' },
    'generateTheme': { 'fr': 'Générer un thème', 'en': 'Generate a theme' },
    'themeCriteria': { 'fr': 'Critères pour le thème (optionnel)', 'en': 'Criteria for theme (optional)' },
    'confirmTheme': { 'fr': 'Confirmer le thème', 'en': 'Confirm theme' },
    'changeTheme': { 'fr': 'Changer le thème', 'en': 'Change theme' },
    'themeConfirmed': { 'fr': 'Thème confirmé', 'en': 'Theme confirmed' },
    'addReferences': { 'fr': 'Ajouter des références (articles, images, vidéos)', 'en': 'Add references (articles, images, videos)' },
    'articleReference': { 'fr': 'Référence article (lien jw.org ou wol.jw.org)', 'en': 'Article reference (jw.org or wol.jw.org link)' },
    'imageReference': { 'fr': 'Référence image (description)', 'en': 'Image reference (description)' },
    'videoReference': { 'fr': 'Référence vidéo (description)', 'en': 'Video reference (description)' },
    'addPointToReinforce': { 'fr': 'Ajouter un point à renforcer pour l\'assemblée', 'en': 'Add point to reinforce for the congregation' },
    'addStrengths': { 'fr': 'Ajouter les points forts de l\'assemblée', 'en': 'Add congregation strengths' },
    'addEncouragements': { 'fr': 'Ajouter des encouragements (optionnel)', 'en': 'Add encouragements (optional)' },
    'generateDiscours': { 'fr': 'Générer le Discours', 'en': 'Generate Discourse' },
    'generatingDiscours': { 'fr': 'Génération du discours en cours...', 'en': 'Generating discourse...' },
    'generationFailed': { 'fr': 'Échec de la génération. Quotas Gemini?', 'en': 'Generation failed. Gemini quotas?' },
    'enterValue': { 'fr': 'Veuillez entrer une valeur.', 'en': 'Please enter a value.' },
    'themeGenerationInProgress': { 'fr': 'Génération du thème en cours...', 'en': 'Generating theme...' },
    'noThemeFound': { 'fr': 'Aucun thème trouvé.', 'en': 'No theme found.' },
    'themeGenerationError': { 'fr': 'Erreur lors de la génération du thème.', 'en': 'Error generating theme.' },
    'invalidTime': { 'fr': 'Temps invalide. Doit être entre 1 et 15 minutes.', 'en': 'Invalid time. Must be between 1 and 15 minutes.' },
  };
  return texts[key]?.[settings.language] || texts[key]?.['fr'];
};

const DiscoursTool: React.FC<Props> = ({ onGenerated, settings, setGlobalLoadingMessage }) => {
  const [discoursType, setDiscoursType] = useState<DiscoursType>(loadInputState('discours-type', 'normal'));
  const [time, setTime] = useState<DiscoursTime | string>(loadInputState('discours-time', ''));
  const [customTime, setCustomTime] = useState<number | ''>(loadInputState('discours-custom-time', ''));
  const [theme, setTheme] = useState(loadInputState('discours-theme', ''));
  const [themeCriteria, setThemeCriteria] = useState(loadInputState('discours-theme-criteria', ''));
  const [themeConfirmed, setThemeConfirmed] = useState<string | null>(loadInputState('discours-theme-confirmed', null));
  const [articleReferences, setArticleReferences] = useState<string[]>(loadInputState('discours-article-refs', ['']));
  const [imageReferences, setImageReferences] = useState<string[]>(loadInputState('discours-image-refs', ['']));
  const [videoReferences, setVideoReferences] = useState<string[]>(loadInputState('discours-video-refs', ['']));
  const [pointsToReinforce, setPointsToReinforce] = useState<string[]>(loadInputState('discours-points-reinforce', ['']));
  const [strengths, setStrengths] = useState<string[]>(loadInputState('discours-strengths', ['']));
  const [encouragements, setEncouragements] = useState(loadInputState('discours-encouragements', ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistence effects
  useEffect(() => { saveInputState('discours-type', discoursType); }, [discoursType]);
  useEffect(() => { saveInputState('discours-time', time); }, [time]);
  useEffect(() => { saveInputState('discours-custom-time', customTime); }, [customTime]);
  useEffect(() => { saveInputState('discours-theme', theme); }, [theme]);
  useEffect(() => { saveInputState('discours-theme-criteria', themeCriteria); }, [themeCriteria]);
  useEffect(() => { saveInputState('discours-theme-confirmed', themeConfirmed); }, [themeConfirmed]);
  useEffect(() => { saveInputState('discours-article-refs', articleReferences); }, [articleReferences]);
  useEffect(() => { saveInputState('discours-image-refs', imageReferences); }, [imageReferences]);
  useEffect(() => { saveInputState('discours-video-refs', videoReferences); }, [videoReferences]);
  useEffect(() => { saveInputState('discours-points-reinforce', pointsToReinforce); }, [pointsToReinforce]);
  useEffect(() => { saveInputState('discours-strengths', strengths); }, [strengths]);
  useEffect(() => { saveInputState('discours-encouragements', encouragements); }, [encouragements]);

  const addReference = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeReference = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateReference = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleGenerateTheme = async () => {
    if (!themeCriteria.trim() && !theme.trim()) {
      setError(getLocalizedText(settings, 'enterValue'));
      return;
    }
    setLoading(true);
    setError(null);
    setGlobalLoadingMessage(getLocalizedText(settings, 'themeGenerationInProgress'));

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DISCOURS_THEME',
          input: themeCriteria || theme,
          settings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || getLocalizedText(settings, 'themeGenerationError'));
      if (data.theme) {
        setTheme(data.theme);
        setThemeConfirmed(data.theme);
      } else {
        setError(getLocalizedText(settings, 'noThemeFound'));
      }
    } catch (err: any) {
      setError(err.message || getLocalizedText(settings, 'themeGenerationError'));
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null);
    }
  };

  const renderTimeSelection = () => {
    let timeOptions: (DiscoursTime | string)[] = [];
    if (discoursType === 'normal' || discoursType === 'special') {
      timeOptions = ['5min', '10min', '30min', '40min', '1h', 'custom'];
    } else if (discoursType === 'jeudi') {
      timeOptions = ['1min', '4min', '5min', '10min', '15min', 'custom'];
    } else if (discoursType === 'dimanche') {
      timeOptions = ['30min']; // Fixed time for Sunday
    }

    return (
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'selectTime')}</label>
        <select value={time} onChange={(e) => setTime(e.target.value as DiscoursTime)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)]">
          <option value="">--</option>
          {timeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {time === 'custom' && (discoursType === 'normal' || discoursType === 'special' || discoursType === 'jeudi') && (
          <input
            type="number"
            value={customTime}
            onChange={(e) => setCustomTime(Number(e.target.value) || '')}
            placeholder={getLocalizedText(settings, 'customTime')}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)]"
            min={discoursType === 'jeudi' ? 1 : undefined}
            max={discoursType === 'jeudi' ? 15 : undefined}
          />
        )}
      </div>
    );
  };

  const renderReferences = () => {
    if (discoursType === 'jeudi') {
      return (
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'articleReference')}</label>
          {articleReferences.map((ref, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={ref} onChange={(e) => updateReference(setArticleReferences, i, e.target.value)} placeholder="Lien jw.org ou wol.jw.org" className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[var(--btn-color)]" />
              <button onClick={() => removeReference(setArticleReferences, i)} className="p-3 text-red-400 bg-red-400/10 rounded-xl"><Minus size={16} /></button>
            </div>
          ))}
          <button onClick={() => addReference(setArticleReferences)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2"><Plus size={16} /> Ajouter un lien article</button>
        </div>
      );
    }

    const showImages = discoursType !== 'jeudi';
    const showVideos = discoursType !== 'jeudi';

    return (
      <div className="space-y-6">
        {showImages && (
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'imageReference')}</label>
            {imageReferences.map((ref, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={ref} onChange={(e) => updateReference(setImageReferences, i, e.target.value)} placeholder="Description de l'image à trouver" className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[var(--btn-color)]" />
                <button onClick={() => removeReference(setImageReferences, i)} className="p-3 text-red-400 bg-red-400/10 rounded-xl"><Minus size={16} /></button>
              </div>
            ))}
            <button onClick={() => addReference(setImageReferences)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2"><Plus size={16} /> Ajouter une image</button>
          </div>
        )}

        {showVideos && (discoursType === 'normal' || discoursType === 'dimanche' || discoursType === 'special') && (
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'videoReference')}</label>
            {videoReferences.map((ref, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={ref} onChange={(e) => updateReference(setVideoReferences, i, e.target.value)} placeholder="Description de la vidéo à trouver" className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[var(--btn-color)]" />
                <button onClick={() => removeReference(setVideoReferences, i)} className="p-3 text-red-400 bg-red-400/10 rounded-xl"><Minus size={16} /></button>
              </div>
            ))}
            <button onClick={() => addReference(setVideoReferences)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2"><Plus size={16} /> Ajouter une vidéo</button>
          </div>
        )}

        <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'articleReference')}</label>
        {articleReferences.map((ref, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input type="text" value={ref} onChange={(e) => updateReference(setArticleReferences, i, e.target.value)} placeholder="Lien jw.org ou wol.jw.org" className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[var(--btn-color)]" />
            <button onClick={() => removeReference(setArticleReferences, i)} className="p-3 text-red-400 bg-red-400/10 rounded-xl"><Minus size={16} /></button>
          </div>
        ))}
        <button onClick={() => addReference(setArticleReferences)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2"><Plus size={16} /> Ajouter un lien article</button>
      </div>
    );
  };

  const renderSpecialDiscoursFields = () => {
    if (discoursType === 'special') {
      return (
        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'addPointToReinforce')}</label>
          {pointsToReinforce.map((point, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={point} onChange={(e) => updateReference(setPointsToReinforce, i, e.target.value)} placeholder="Ex: Améliorer la participation aux réunions" className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[var(--btn-color)]" />
              <button onClick={() => removeReference(setPointsToReinforce, i)} className="p-3 text-red-400 bg-red-400/10 rounded-xl"><Minus size={16} /></button>
            </div>
          ))}
          <button onClick={() => addReference(setPointsToReinforce)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2"><Plus size={16} /> Ajouter un point à renforcer</button>

          <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'addStrengths')}</label>
          {strengths.map((strength, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={strength} onChange={(e) => updateReference(setStrengths, i, e.target.value)} placeholder="Ex: Excellente hospitalité" className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[var(--btn-color)]" />
              <button onClick={() => removeReference(setStrengths, i)} className="p-3 text-red-400 bg-red-400/10 rounded-xl"><Minus size={16} /></button>
            </div>
          ))}
          <button onClick={() => addReference(setStrengths)} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2"><Plus size={16} /> Ajouter un point fort</button>

          <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'addEncouragements')}</label>
          <textarea value={encouragements} onChange={(e) => setEncouragements(e.target.value)} placeholder="Ex: Continuez à montrer de l'amour..." className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)] transition-all resize-none text-sm" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-4">
          <div className="p-3 bg-[var(--btn-color)] rounded-2xl"><Mic size={28} /></div>
          {getLocalizedText(settings, 'discours')}
        </h2>

        {!themeConfirmed ? (
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'selectDiscoursType')}</label>
            <select value={discoursType} onChange={(e) => setDiscoursType(e.target.value as DiscoursType)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)]">
              <option value="normal">{getLocalizedText(settings, 'normalDiscours')}</option>
              <option value="jeudi">{getLocalizedText(settings, 'jeudiDiscours')}</option>
              <option value="dimanche">{getLocalizedText(settings, 'dimancheDiscours')}</option>
              <option value="special">{getLocalizedText(settings, 'specialDiscours')}</option>
            </select>

            {renderTimeSelection()}

            <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'enterTheme')}</label>
            <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex: Les bienfaits du Royaume de Dieu" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)]" />

            <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'themeCriteria')}</label>
            <textarea value={themeCriteria} onChange={(e) => setThemeCriteria(e.target.value)} placeholder="Ex: Thème pour les jeunes, encourageant, basé sur Psaumes" className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)] resize-none" />

            {error && <div className="p-4 bg-red-400/10 text-red-400 rounded-xl text-xs font-bold">{error}</div>}

            <button
              onClick={handleGenerateTheme}
              disabled={loading || (!theme.trim() && !themeCriteria.trim())}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
              className="w-full py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
              {getLocalizedText(settings, 'generateTheme')}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500 space-y-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase text-[var(--btn-color)] tracking-widest">{getLocalizedText(settings, 'themeConfirmed')}</span>
                <h3 className="text-2xl font-black mt-1 uppercase tracking-tight">{themeConfirmed}</h3>
              </div>
              <button onClick={() => setThemeConfirmed(null)} className="text-xs font-bold opacity-30 hover:opacity-100 uppercase underline">{getLocalizedText(settings, 'changeTheme')}</button>
            </div>

            {renderReferences()}
            {renderSpecialDiscoursFields()}

            {error && <div className="p-4 bg-red-400/10 text-red-400 rounded-xl text-xs font-bold">{error}</div>}

            <button
              onClick={handleGenerateDiscours}
              disabled={loading}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
              className="w-full py-8 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" /> : <BookOpen size={32} />}
              {getLocalizedText(settings, 'generateDiscours')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoursTool;
  const handleGenerateDiscours = async () => {
    if (!themeConfirmed) {
      setError(getLocalizedText(settings, 'confirmTheme'));
      return;
    }
    if (discoursType === 'jeudi' && time === 'custom' && (customTime === '' || customTime < 1 || customTime > 15)) {
      setError(getLocalizedText(settings, 'invalidTime'));
      return;
    }

    setLoading(true);
    setError(null);
    setGlobalLoadingMessage(getLocalizedText(settings, 'generatingDiscours'));

    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DISCOURS',
          discoursType,
          time: time === 'custom' ? customTime : time,
          theme: themeConfirmed,
          articleReferences: articleReferences.filter(Boolean),
          imageReferences: imageReferences.filter(Boolean),
          videoReferences: videoReferences.filter(Boolean),
          pointsToReinforce: pointsToReinforce.filter(Boolean),
          strengths: strengths.filter(Boolean),
          encouragements,
          settings,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || getLocalizedText(settings, 'generationFailed'));

      const study: GeneratedStudy = {
        id: Date.now().toString(),
        type: 'DISCOURS',
        title: themeConfirmed,
        date: new Date().toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : settings.language === 'es' ? 'es-ES' : 'en-US'),
        content: data.text,
        timestamp: Date.now(),
        category: `discours_${discoursType}` as any,
        url: articleReferences.filter(Boolean).join(', ') || 'N/A',
        aiExplanation: data.text,
      };

      onGenerated(study);
      // Reset form
      setDiscoursType('normal');
      setTime('');
      setCustomTime('');
      setTheme('');
      setThemeCriteria('');
      setThemeConfirmed(null);
      setArticleReferences(['']);
      setImageReferences(['']);
      setVideoReferences(['']);
      setPointsToReinforce(['']);
      setStrengths(['']);
      setEncouragements('');

    } catch (err: any) {
      setError(err.message || getLocalizedText(settings, 'generationFailed'));
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null);
    }
  };