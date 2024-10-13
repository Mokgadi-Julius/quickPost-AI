import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import PromptGenerator from './components/PromptGenerator';
import ParticleBackground from './components/ParticleBackground';
import ThemeSwitcher from './components/ThemeSwitcher';
import { darkTheme, lightTheme } from './theme';

const AppWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: ${props => props.theme.background};
  transition: all 0.3s ease;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

function App() {
  const [theme, setTheme] = useState(darkTheme);

  const toggleTheme = () => {
    setTheme(theme.name === 'dark' ? lightTheme : darkTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppWrapper>
        <ParticleBackground />
        <ContentWrapper>
          <ThemeSwitcher toggleTheme={toggleTheme} currentTheme={theme.name as 'light' | 'dark'} />
          <PromptGenerator currentTheme={theme.name as 'light' | 'dark'} />
        </ContentWrapper>
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;