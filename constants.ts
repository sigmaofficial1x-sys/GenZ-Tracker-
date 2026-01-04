
import { ThemeConfig } from './types';

export const THEMES: Record<string, ThemeConfig> = {
  cottonCandy: {
    name: 'Cotton Candy',
    bgMain: '#fdf2f8',
    bgPanel: 'rgba(255, 255, 255, 0.8)',
    textPrimary: '#831843',
    textSecondary: '#db2777',
    accent1: '#f472b6',
    accent2: '#a78bfa',
    accent3: '#38bdf8',
    chartFill: 'rgba(244, 114, 182, 0.4)',
    weather: 'sun',
    font: "'Inter', sans-serif"
  },
  northernLights: {
    name: 'Northern Lights',
    bgMain: '#020617',
    bgPanel: 'rgba(15, 23, 42, 0.8)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent1: '#10b981',
    accent2: '#d946ef',
    accent3: '#6366f1',
    chartFill: 'rgba(16, 185, 129, 0.4)',
    weather: 'stars',
    font: "'Inter', sans-serif"
  },
  goldenHour: {
    name: 'Golden Hour',
    bgMain: '#451a03',
    bgPanel: 'rgba(67, 20, 7, 0.8)',
    textPrimary: '#fff7ed',
    textSecondary: '#fbbf24',
    accent1: '#f59e0b',
    accent2: '#ea580c',
    accent3: '#fde047',
    chartFill: 'rgba(245, 158, 11, 0.4)',
    weather: 'sun',
    font: "'Inter', sans-serif"
  },
  deepSea: {
    name: 'Deep Sea',
    bgMain: '#082f49',
    bgPanel: 'rgba(12, 74, 110, 0.8)',
    textPrimary: '#f0f9ff',
    textSecondary: '#38bdf8',
    accent1: '#22d3ee',
    accent2: '#0ea5e9',
    accent3: '#2dd4bf',
    chartFill: 'rgba(34, 211, 238, 0.4)',
    weather: 'snow',
    font: "'Inter', sans-serif"
  },
  vibrantForest: {
    name: 'Vibrant Forest',
    bgMain: '#064e3b',
    bgPanel: 'rgba(2, 44, 34, 0.8)',
    textPrimary: '#ecfdf5',
    textSecondary: '#34d399',
    accent1: '#10b981',
    accent2: '#84cc16',
    accent3: '#facc15',
    chartFill: 'rgba(16, 185, 129, 0.4)',
    weather: 'snow',
    font: "'Inter', sans-serif"
  }
};

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const INITIAL_HABITS = [
  "Hydration (2L)",
  "Daily Reading",
  "Movement",
  "Stillness",
  "Early Rest"
];

export const INITIAL_RULES = [
  "Progress over perfection.",
  "Never skip twice.",
  "Identify as the person you want to be."
];
