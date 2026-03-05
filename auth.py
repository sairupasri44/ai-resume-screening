import hashlib
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pass(password):
    password = hashlib.sha256(password.encode()).hexdigest()
    return pwd.hash(password)

def verify_pass(password, hashed):
    password = hashlib.sha256(password.encode()).hexdigest()
    return pwd.verify(password, hashed)