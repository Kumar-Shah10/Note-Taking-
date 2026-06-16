import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from '../../hooks/useNavigation.js';
import '../styles/login.css';

const Login = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="login-brand">
          <span className="login-logo">✦</span>
          <span className="login-brand-name">NoteSphere</span>
        </div>
        <div className="login-tagline">
          <h1>Your thoughts,<br /><em>beautifully kept.</em></h1>
          <p>A quiet place for ideas, drafts, and everything in between.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your notes</p>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />

              <div className="login-field-row">
                <label htmlFor="password">Password</label>
                <button type="button" onClick={onSwitchToForgotPassword} className="login-forgot">
                  Forgot password?
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="login-switch">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;