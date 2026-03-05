import { AppSettings, AppView, GeneratedStudy, StudyPart, PredicationType } from '../types';
import { callGenerateContentApi } from './apiService';
import { callSearchContentApi } from './searchApiService';
import { ContentOptions } from '../components/ContentInclusion';

export const generateStudyContent = async (
  view: AppView,
  input: string | string[],
  settings: AppSettings,
  contentOptions?: ContentOptions,
  part: StudyPart = 'tout',
  preachingType?: PredicationType
): Promise<GeneratedStudy> => {
  
  // Déterminer le type d'étude selon l'onglet
  let type: 'WATCHTOWER' | 'MINISTRY' | 'PREDICATION' = 'WATCHTOWER';
  if (view === AppView.MINISTRY) type = 'MINISTRY';
  if (view === AppView.PREDICATION) type = 'PREDICATION';

  // Appel à l'API de génération (Scraping + Analyse)
  const result = await callGenerateContentApi(
    type,
    input,
    part,
    settings,
    false,
    preachingType,
    contentOptions
  );

  return {
    id: Date.now().toString(),
    type: view,
    title: result.title || "Nouvelle Étude",
    content: result.text,
    date: new Date().toISOString(),
    rawSources: result.rawSources
  };
};

export const performSearch = async (
  query: string,
  settings: AppSettings,
  contentOptions?: ContentOptions,
  confirmMode: boolean = false
) => {
  // Appel à l'API de recherche (Grounding Google Search)
  return await callSearchContentApi(query, settings, confirmMode, contentOptions);
};