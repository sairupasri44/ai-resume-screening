import { useState, useEffect, useRef } from 'react';
import { getJobs, applyForJob, getCandidateApplications } from '../services/api';

export default function CandidateDashboard({ user }) {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const fileInputs = useRef({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [jobsData, appsData] = await Promise.all([
                getJobs(),
                getCandidateApplications(user.id)
            ]);
            setJobs(jobsData);
            setApplications(appsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        const fileInput = fileInputs.current[jobId];
        if (!fileInput || !fileInput.files[0]) {
            setError("Please select a PDF resume to apply.");
            return;
        }

        setError(null);
        setSuccessMsg(null);
        try {
            await applyForJob(jobId, user.id, fileInput.files[0]);
            setSuccessMsg("Successfully applied to the job!");
            fileInput.value = ""; // Clear file
            fetchData(); // Refresh statuses
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div>Loading jobs...</div>;

    const appliedJobIds = new Set(applications.map(a => a.job_id));

    return (
        <div className="dashboard-container animate-fade-in">
            <h2 className="dashboard-header">Browse Available Roles</h2>
            
            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div className="grid">
                {jobs.length === 0 ? (
                    <p>No jobs available at the moment.</p>
                ) : (
                    jobs.map(job => {
                        const hasApplied = appliedJobIds.has(job.id);
                        return (
                            <div key={job.id} className="glass-panel job-card">
                                <h3>{job.title}</h3>
                                <p className="job-desc">{job.description}</p>
                                
                                {hasApplied ? (
                                    <button className="btn btn-secondary" disabled>
                                        Status: Applied Wait For Mail
                                    </button>
                                ) : (
                                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div className="file-input-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                                            <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '10px' }}>
                                                Upload Resume (PDF)
                                            </button>
                                            <input 
                                                type="file" 
                                                accept=".pdf"
                                                ref={el => fileInputs.current[job.id] = el}
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                                onChange={() => setSuccessMsg("File selected!")}
                                            />
                                        </div>
                                        <button className="btn" onClick={() => handleApply(job.id)}>
                                            Submit Application
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <h2 className="dashboard-header" style={{ marginTop: '3rem' }}>Your Applications</h2>
            <div className="glass-panel">
                {applications.length === 0 ? (
                    <p>You haven't applied to any jobs yet.</p>
                ) : (
                    <div className="applicant-list">
                        {applications.map(app => (
                            <div key={app.job_id} className="applicant-item">
                                <div>
                                    <h4 style={{ margin: 0 }}>{app.job_title}</h4>
                                    <small style={{ color: 'rgba(255,255,255,0.6)' }}>
                                        Applied: {new Date(app.applied_at).toLocaleDateString()}
                                    </small>
                                </div>
                                <span className={`badge ${app.score >= 70 ? 'badge-success' : 'badge-warning'}`}>
                                    Under Review (Score: {app.score}%)
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
