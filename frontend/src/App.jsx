import { useState } from 'react';
import Auth from './components/Auth';
import RecruiterDashboard from './components/RecruiterDashboard';
import CandidateDashboard from './components/CandidateDashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {user && (
        <nav className="nav-bar">
          <div className="nav-brand">
            🤖 Resume AI
          </div>
          <div className="nav-user">
            <span>Welcome, {user.email} ({user.role})</span>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 1rem', width: 'auto' }}>
              Logout
            </button>
          </div>
        </nav>
      )}

      {!user ? (
        <Auth onLogin={(userData) => setUser(userData)} />
      ) : user.role === 'recruiter' ? (
        <RecruiterDashboard user={user} />
      ) : (
        <CandidateDashboard user={user} />
      )}
    </>
  );
}

export default App;
