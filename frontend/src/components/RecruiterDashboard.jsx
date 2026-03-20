import { useState, useEffect } from 'react';
import { getRecruiterJobs, postJob } from '../services/api';

export default function RecruiterDashboard({ user }) {
    const [jobs, setJobs] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoadingOp, setIsLoadingOp] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await getRecruiterJobs(user.id);
            setJobs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoadingOp(true);
        try {
            await postJob(title, description, user.id);
            setSuccessMsg("Job Posted Successfully!");
            setTitle("");
            setDescription("");
            fetchJobs();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingOp(false);
        }
    };

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="dashboard-container animate-fade-in">
            <h2 className="dashboard-header">Recruiter Dashboard</h2>
            
            <div className="grid" style={{ marginBottom: "2rem" }}>
                <div className="glass-panel">
                    <h3>Post a New Job</h3>
                    {error && <div className="alert alert-error">{error}</div>}
                    {successMsg && <div className="alert alert-success">{successMsg}</div>}
                    <form onSubmit={handlePostJob}>
                        <div className="form-group">
                            <label>Job Title</label>
                            <input 
                                type="text" 
                                required 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description & Requirements</label>
                            <textarea 
                                required 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                placeholder="Describe the role, requirements, skills..."
                            />
                        </div>
                        <button type="submit" className="btn" disabled={isLoadingOp}>
                            {isLoadingOp ? "Posting..." : "Post Job"}
                        </button>
                    </form>
                </div>
            </div>

            <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Your Active Postings</h3>
            <div className="grid">
                {jobs.length === 0 ? (
                    <p>No jobs posted yet.</p>
                ) : (
                    jobs.map(job => (
                        <div key={job.id} className="glass-panel job-card">
                            <h3 style={{ color: "var(--primary)" }}>{job.title}</h3>
                            <p className="job-desc" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {job.description}
                            </p>
                            
                            <h4 style={{ marginTop: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
                                Applicants ({job.applicants.length})
                            </h4>
                            
                            <div className="applicant-list" style={{ overflowY: "auto", maxHeight: "200px" }}>
                                {job.applicants.length === 0 ? (
                                    <small style={{ color: "rgba(255,255,255,0.6)" }}>No applicants yet.</small>
                                ) : (
                                    job.applicants.sort((a,b) => b.score - a.score).map((app, index) => (
                                        <div key={app.id} className="applicant-item" style={{ background: index === 0 ? 'rgba(0, 201, 167, 0.1)' : '' }}>
                                            <span style={{ fontSize: "0.9rem" }}>{app.email}</span>
                                            <span className={`badge ${app.score >= 70 ? 'badge-success' : 'badge-warning'}`}>
                                                Match: {app.score}%
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
