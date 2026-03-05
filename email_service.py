import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SENDER_EMAIL = "suji270306@gmail.com"
SENDER_PASSWORD = "cerx autf vvni ltal"


def send_email(to_email, subject, body):
    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(SENDER_EMAIL, SENDER_PASSWORD)
    server.send_message(msg)
    server.quit()


def application_received_mail(candidate_email):
    subject = "Application Received Successfully – AI Resume Screening System"
    body = """
Dear Candidate,

Your application has been received successfully.

Our AI system is evaluating your resume.
You will receive the final status mail after 24 hours.

Best Regards,
Recruitment Team
"""
    send_email(candidate_email, subject, body)


def selection_rejection_mail(candidate_email, score):
    if score >= 70:
        subject = "Congratulations! You are Shortlisted 🎉"
        body = """
Dear Candidate,

Great news! Based on our AI screening,
you are shortlisted for the next round.

HR will contact you soon.

Best Regards,
Recruitment Team
"""
    else:
        subject = "Update on Your Application Status"
        body = """
Dear Candidate,

Thank you for applying.

After evaluation, your profile was not shortlisted
for this role. We encourage you to apply again.

Best Regards,
Recruitment Team
"""
    send_email(candidate_email, subject, body)