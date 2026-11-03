import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colors, setColors] = useState({
    primary: '#89CFF0',
    secondary: '#B0E0E6',
    background: '#F5F5F5',
    text: '#333333',
    textLight: '#FFFFFF',
    danger: '#E57373',
    disabled: '#CCCCCC',
  });

  return (
    <ThemeContext.Provider value={{ colors, setColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);