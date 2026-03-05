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

export const generateDiscourseTheme = async (
  input: string,
  settings: AppSettings
): Promise<string> => {
  const result = await callGenerateContentApi(
    'DISCOURS_THEME',
    input,
    'tout',
    settings,
    false,
    undefined,
    undefined
  );
  return result.theme || "Thème généré";
};

export const generateDiscourseContent = async (
  discoursType: string,
  time: string,
  theme: string,
  settings: AppSettings,
  contentOptions?: ContentOptions
): Promise<GeneratedStudy> => {
  // We need to extend callGenerateContentApi to accept discoursType, time, theme
  // Or we can just call the API directly here to avoid changing apiService.ts signature too much
  // But to keep it clean, let's assume we update apiService.ts or just use fetch here.
  // Given the user wants to "bridge the interface and APIs", using fetch here is fine if apiService is too rigid.
  // However, apiService is just a wrapper around fetch. Let's use fetch directly here for simplicity and to ensure we pass all specific params.
  
  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'DISCOURS',
      discoursType,
      time,
      theme,
      articleReferences: contentOptions?.articleLinks,
      settings,
      contentOptions,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.details || 'Failed to generate discourse');
  }

  const result = await response.json();

  return {
    id: Date.now().toString(),
    type: AppView.DISCOURS,
    title: theme,
    content: result.text,
    date: new Date().toISOString(),
    rawSources: [] // Discourse generation usually doesn't return structured sources in the same way, or we can parse them if needed
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