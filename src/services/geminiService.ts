import { AppSettings, AppView, GeneratedStudy, StudyPart, PredicationType } from '../types';
import { 
  generateStudyContentFrontend, 
  generateDiscourseContentFrontend, 
  generateDiscourseThemeFrontend, 
  performSearchFrontend 
} from './geminiFrontend';
import { ContentOptions } from '../components/ContentInclusion';

export const generateStudyContent = async (
  view: AppView,
  input: string | string[],
  settings: AppSettings,
  contentOptions?: ContentOptions,
  part: StudyPart = 'tout',
  preachingType?: PredicationType
): Promise<GeneratedStudy> => {
  
  const result = await generateStudyContentFrontend(
    view === AppView.MINISTRY ? 'MINISTRY' : view === AppView.PREDICATION ? 'PREDICATION' : 'WATCHTOWER',
    input,
    settings,
    contentOptions,
    part,
    preachingType
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
  input: string
): Promise<string> => {
  return await generateDiscourseThemeFrontend(input);
};

export const generateDiscourseContent = async (
  discoursType: string,
  time: string,
  theme: string,
  settings: AppSettings
): Promise<GeneratedStudy> => {
  
  const result = await generateDiscourseContentFrontend(
    discoursType,
    time,
    theme,
    settings
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
  confirmMode: boolean = false
) => {
  return await performSearchFrontend(query, settings, confirmMode, contentOptions);
};
