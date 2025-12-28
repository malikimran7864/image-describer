
export interface VisualAnchor {
  subject: string;
  geometry: string;
  lighting: string;
}

export interface NarrativeArc {
  logline: string;
  mood: string[];
}

export interface Shot {
  id: number;
  type: string;
  duration: string;
  description: string;
  imagePrompt: string;
  motionPrompt: string;
  soundDesign: string;
}

export interface AnalysisResult {
  visualAnchor: VisualAnchor;
  narrativeArc: NarrativeArc;
  shotList: Shot[];
  consistencyCheck: string;
}

export interface AppState {
  image: string | null;
  result: AnalysisResult | null;
  storyboardImageUrl: string | null;
  isLoading: boolean;
  isGeneratingStoryboard: boolean;
  error: string | null;
}
