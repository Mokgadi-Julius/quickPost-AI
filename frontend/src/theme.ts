import { DefaultTheme } from 'styled-components';

export const darkTheme: DefaultTheme = {
  name: 'dark',
  background: '#1a1a2e',
  cardBackground: '#16213e',
  text: '#e94560',
  primary: '#0f3460',
  secondary: '#533483',
  border: '#30475e',
  inputBackground: '#222831',
  buttonText: '#ffffff',
  error: '#ff6b6b',
  previewBackground: '#1f2937',
};

export const lightTheme: DefaultTheme = {
  name: 'light',
  background: '#f0f2f5',
  cardBackground: '#ffffff',
  text: '#333333',
  primary: '#4a90e2',
  secondary: '#50c878',
  border: '#d1d1d1',
  inputBackground: '#ffffff',
  buttonText: '#ffffff',
  error: '#e74c3c',
  previewBackground: '#f9fafb',
};

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    background: string;
    cardBackground: string;
    text: string;
    primary: string;
    secondary: string;
    border: string;
    inputBackground: string;
    buttonText: string;
    error: string;
    previewBackground: string;
  }
}