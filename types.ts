
export interface Problem {
  id: string;
  text: string;
  done: boolean;
}

export type AvatarGender = 'masculine' | 'feminine' | 'neutral';

export type AvatarType = string; // Emoji or URL

export interface AppState {
  userName: string;
  habits: string[];
  rules: string[];
  problems: Problem[];
  data: Record<string, boolean[][]>;
  theme: string;
  notes: string;
  avatarType: AvatarType;
  avatarGender: AvatarGender;
  customAvatarUrl?: string;
  tip: string;
  globalScale: number;
  panelSizes: {
    sidebar: number;
    mainGrid: number;
    stats: number;
  };
}

export interface ThemeConfig {
  name: string;
  bgMain: string;
  bgPanel: string;
  textPrimary: string;
  textSecondary: string;
  accent1: string;
  accent2: string;
  accent3: string;
  chartFill: string;
  weather: 'stars' | 'snow' | 'sun';
  font: string;
}
