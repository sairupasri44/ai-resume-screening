import { useState } from 'react';
import { loginCall, signupCall } from '../services/api';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState("Candidate");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLogin) {
                const data = await loginCall(email, password, role);
                onLogin(data.user);
            } else {
                await signupCall(email, password, role);
                const data = await loginCall(email, password, role);
                onLogin(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="glass-panel auth-card">
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    🤖 AI Resume Screening
                </h2>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <button 
                        className={`btn ${role === "Candidate" ? "" : "btn-secondary"}`} 
                        onClick={() => setRole("Candidate")}
                    >Candidate</button>
                    <button 
                        className={`btn ${role === "Recruiter" ? "" : "btn-secondary"}`}
                        onClick={() => setRole("Recruiter")}
                    >Recruiter</button>
                </div>
                
                <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
                    {role} {isLogin ? "Login" : "Sign Up"}
                </h3>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? "Processing..." : (isLogin ? "Login" : "Create Account")}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span 
                        style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "600" }}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </span>
                </div>
            </div>
        </div>
    );
}
