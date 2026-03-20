from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import re

from database import SessionLocal, engine, Base
from models import User, Job, Application
from auth import hash_pass, verify_pass
from resume_parser import extract_text
from matcher import calculate_match
from email_service import application_received_mail
from scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the scheduler when the app starts
    start_scheduler()
    yield
    # Cleanup if necessary

app = FastAPI(lifespan=lifespan, title="AI Resume Screening System API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict to actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class UserSignup(BaseModel):
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

class JobCreate(BaseModel):
    title: str
    description: str
    recruiter_id: int

# Auth Endpoints
@app.post("/api/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter_by(email=user.email, role=user.role.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user = User(email=user.email, password=hash_pass(user.password), role=user.role.lower())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Account created successfully!", "user_id": new_user.id}

@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter_by(email=user.email, role=user.role.lower()).first()
    if db_user and verify_pass(user.password, db_user.password):
        return {
            "message": "Logged in successfully!",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "role": db_user.role
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Job Endpoints
@app.post("/api/jobs")
def post_job(job: JobCreate, db: Session = Depends(get_db)):
    new_job = Job(title=job.title, description=job.description, recruiter_id=job.recruiter_id)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return {"message": "Job Posted Successfully!", "job_id": new_job.id}

@app.get("/api/jobs")
def get_all_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    return [{"id": j.id, "title": j.title, "description": j.description, "recruiter_id": j.recruiter_id} for j in jobs]

@app.get("/api/jobs/{recruiter_id}/recruiter_jobs")
def get_recruiter_jobs(recruiter_id: int, db: Session = Depends(get_db)):
    jobs = db.query(Job).filter_by(recruiter_id=recruiter_id).all()
    result = []
    for job in jobs:
        apps = db.query(Application).filter_by(job_id=job.id).all()
        applicants = [{"id": a.id, "email": a.candidate_email, "score": a.score} for a in apps]
        result.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "applicants": applicants
        })
    return result

# Application Endpoint
@app.post("/api/jobs/{job_id}/apply")
async def apply_job(
    job_id: int, 
    candidate_id: int = Form(...), 
    resume: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported")

    # Fastapi UploadFile file object can be passed to resume parser
    text = extract_text(resume.file)
    score = calculate_match(job.description, text)
    email_match = re.findall(r'\S+@\S+', text)
    
    if email_match:
        email = email_match[0]
        db.add(Application(
            job_id=job.id,
            candidate_id=candidate_id,
            candidate_email=email,
            score=score
        ))
        db.commit()
        application_received_mail(email)
        return {"message": "Applied Successfully!", "score": score, "candidate_email": email}
    else:
        raise HTTPException(status_code=400, detail="No email found in resume")

@app.get("/api/candidate/{candidate_id}/applications")
def get_candidate_applications(candidate_id: int, db: Session = Depends(get_db)):
    apps = db.query(Application).filter_by(candidate_id=candidate_id).all()
    result = []
    for a in apps:
        job = db.query(Job).filter_by(id=a.job_id).first()
        if job:
            result.append({
                "job_id": job.id,
                "job_title": job.title,
                "score": a.score,
                "applied_at": a.applied_at
            })
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
