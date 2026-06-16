import { createContext, useContext } from 'react';

export const NavigationContext = createContext();

export const useNavigate = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigate must be used within NavigationProvider');
  return context.navigate;
};

export const useCurrentPage = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useCurrentPage must be used within NavigationProvider');
  return context.currentPage;
};

export const useParams = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useParams must be used within NavigationProvider');
  return context.params;
};