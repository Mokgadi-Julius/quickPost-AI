import React from 'react';
import styled from 'styled-components';
import { FiSun, FiMoon } from 'react-icons/fi';

const SwitchContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const SwitchButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

interface ThemeSwitcherProps {
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ toggleTheme, currentTheme }) => {
  return (
    <SwitchContainer>
      <SwitchButton onClick={toggleTheme}>
        {currentTheme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
      </SwitchButton>
    </SwitchContainer>
  );
};

export default ThemeSwitcher;