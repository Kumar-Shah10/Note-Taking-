import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from '../../hooks/useNavigation.js';
import '../styles/register.css';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.username);
      navigate('dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="register-root">
      <div className="register-left">
        <div className="register-brand">
          <span className="register-logo">✦</span>
          <span className="register-brand-name">NoteSphere</span>
        </div>
        <div className="register-tagline">
          <h1>Begin your<br /><em>story here.</em></h1>
          <p>Join a quiet place for ideas, drafts, and everything in between.</p>
        </div>
      </div>

      <div className="register-right">
        <div className="register-form-wrap">
          <div className="register-form-header">
            <h2>Create account</h2>
            <p>Sign up to start capturing your thoughts</p>
          </div>

          {error && (
            <div className="register-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-field">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                autoComplete="username"
              />
            </div>

            <div className="register-field">
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

            <div className="register-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="register-submit" disabled={loading}>
              {loading ? (
                <span className="register-spinner" />
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="register-switch">
            Already have an account?{' '}
            <button type="button" onClick={onSwitchToLogin}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;