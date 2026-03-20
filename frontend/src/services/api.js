const API_URL = "http://localhost:8000/api";

export const loginCall = async (email, password, role) => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, role })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");
    return data;
};

export const signupCall = async (email, password, role) => {
    const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, role })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Signup failed");
    return data;
};

export const getJobs = async () => {
    const response = await fetch(`${API_URL}/jobs`);
    if (!response.ok) throw new Error("Failed to fetch jobs");
    return response.json();
};

export const getRecruiterJobs = async (recruiterId) => {
    const response = await fetch(`${API_URL}/jobs/${recruiterId}/recruiter_jobs`);
    if (!response.ok) throw new Error("Failed to fetch recruiter jobs");
    return response.json();
};

export const postJob = async (title, description, recruiterId) => {
    const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description, recruiter_id: recruiterId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to post job");
    return data;
};

export const applyForJob = async (jobId, candidateId, file) => {
    const formData = new FormData();
    formData.append("candidate_id", candidateId);
    formData.append("resume", file);

    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: "POST",
        body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to apply");
    return data;
};

export const getCandidateApplications = async (candidateId) => {
    const response = await fetch(`${API_URL}/candidate/${candidateId}/applications`);
    if (!response.ok) throw new Error("Failed to fetch applications");
    return response.json();
};
