import { useState, useCallback } from 'react';
import { NavigationContext } from '../hooks/useNavigation.js';

export const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('login');
  const [params, setParams] = useState({});

  const navigate = useCallback((page, pageParams = {}) => {
    setCurrentPage(page);
    setParams(pageParams);
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPage, navigate, params }}>
      {children}
    </NavigationContext.Provider>
  );
};