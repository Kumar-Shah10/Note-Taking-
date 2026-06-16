import { useEffect, useState } from 'react';
import { getAuthToken, getUser } from './utils/storage';
import { useAuth } from './hooks/useAuth';
import { NavigationProvider } from './context/NavigationProvider.jsx';
import { useNavigate, useCurrentPage } from './hooks/useNavigation.js';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import './styles/global.css';

const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get('token');

const AppContent = () => {
  const [authPage, setAuthPage] = useState(urlToken ? 'reset' : 'login');
  const [resetToken, setResetToken] = useState(urlToken);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentPage = useCurrentPage();

  // runs once on mount — checks if already logged in
  useEffect(() => {
    const token = getAuthToken();
    const user = getUser();
    if (token && user) {
      navigate('dashboard');
    }
  }, [navigate]); // navigate is now stable, no infinite loop

  // separate effect — reacts to login/logout
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
    }
  }, [isAuthenticated, navigate]);

  const handleSwitchToLogin        = () => { setAuthPage('login');    setResetToken(null); };
  const handleSwitchToRegister     = () => setAuthPage('register');
  const handleSwitchToForgotPassword = () => setAuthPage('forgot');

  return (
    <div className="app">
      {currentPage === 'login' && (
        <>
          {authPage === 'login' && (
            <Login
              onSwitchToRegister={handleSwitchToRegister}
              onSwitchToForgotPassword={handleSwitchToForgotPassword}
            />
          )}
          {authPage === 'register' && (
            <Register onSwitchToLogin={handleSwitchToLogin} />
          )}
          {authPage === 'forgot' && (
            <ForgotPassword onSwitchToLogin={handleSwitchToLogin} />
          )}
          {authPage === 'reset' && resetToken && (
            <ResetPassword token={resetToken} onResetComplete={handleSwitchToLogin} />
          )}
        </>
      )}
      {currentPage === 'dashboard' && <Dashboard />}
    </div>
  );
};

function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

export default App;