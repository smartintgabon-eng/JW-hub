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
  preachingType?: PredicationType,
  onStream?: (text: string) => void
): Promise<GeneratedStudy> => {
  
  const result = await callGenerateContentApi(
    view === AppView.MINISTRY ? 'MINISTRY' : view === AppView.PREDICATION ? 'PREDICATION' : 'WATCHTOWER',
    input,
    part,
    settings,
    false,
    preachingType,
    contentOptions,
    undefined,
    onStream
  );

  return {
    id: Date.now().toString(),
    type: view,
    title: result.title || "Nouvelle Étude",
    content: result.text,
    date: new Date().toISOString(),
    timestamp: Date.now(),
    rawSources: result.rawSources || []
  } as GeneratedStudy;
};

export const generateDiscourseTheme = async (
  input: string,
  settings: AppSettings
): Promise<string> => {
  // We don't have a direct theme API, but we can use generate-content with a specific type
  const result = await callGenerateContentApi(
    'DISCOURS_THEME',
    input,
    'tout',
    settings,
    false,
    undefined
  );
  return result.theme || result.text.trim();
};

export const generateDiscourseContent = async (
  discoursType: string,
  time: string,
  theme: string,
  settings: AppSettings,
  contentOptions?: ContentOptions,
  onStream?: (text: string) => void
): Promise<GeneratedStudy> => {
  
  const result = await callGenerateContentApi(
    'DISCOURS',
    '',
    'tout',
    settings,
    false,
    undefined,
    contentOptions,
    { discoursType, time, theme },
    onStream
  );

  return {
    id: Date.now().toString(),
    type: AppView.DISCOURS,
    title: theme,
    content: result.text,
    date: new Date().toISOString(),
    rawSources: []
  };
};

export const performSearch = async (
  query: string,
  settings: AppSettings,
  contentOptions?: ContentOptions,
  confirmMode: boolean = false,
  onStream?: (text: string) => void,
  part?: string
) => {
  return await callSearchContentApi(query, settings, confirmMode, contentOptions, onStream, part);
};
