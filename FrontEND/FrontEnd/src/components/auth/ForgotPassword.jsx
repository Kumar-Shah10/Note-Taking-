import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../styles/ForgetPassword.css';

const ForgotPassword = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { forgotPassword, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await forgotPassword(email);
      setMessage('If an account exists with this email, a reset link will be sent. Check your inbox.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request');
    }
  };

  return (
    <div className="forgot-root">
      <div className="forgot-left">
        <div className="forgot-brand">
          <span className="forgot-logo">✦</span>
          <span className="forgot-brand-name">NoteSphere</span>
        </div>
        <div className="forgot-tagline">
          <h1>Happens to<br /><em>the best of us.</em></h1>
          <p>We'll send you a link to get back into your account in no time.</p>
        </div>
      </div>

      <div className="forgot-right">
        <div className="forgot-form-wrap">
          <div className="forgot-form-header">
            <h2>Reset password</h2>
            <p>Enter your email and we'll send you a reset link</p>
          </div>

          {error && (
            <div className="forgot-error">
              <span>⚠</span> {error}
            </div>
          )}

          {message && (
            <div className="forgot-success">
              <span>✓</span> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="forgot-form">
            <div className="forgot-field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <button type="submit" className="forgot-submit" disabled={loading}>
              {loading ? (
                <span className="forgot-spinner" />
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          <p className="forgot-back">
            Remembered it?{' '}
            <button type="button" onClick={onSwitchToLogin}>
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;