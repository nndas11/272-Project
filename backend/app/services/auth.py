from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from argon2 import PasswordHasher
from sqlalchemy.orm import Session
from app.config import settings
from app.models.user import User, Session as SessionModel
import secrets

argon2_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    """Hash password using argon2id"""
    return argon2_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        argon2_hasher.verify(hashed_password, plain_password)
        return True
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expires_min)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None


def create_session(db: Session, user_id: int, jti: str, expires_at: datetime) -> SessionModel:
    """Create a session record"""
    session = SessionModel(user_id=user_id, jti=jti, expires_at=expires_at)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, email: str, password: str) -> User:
    """Create a new user"""
    hashed_password = hash_password(password)
    user = User(email=email, password_hash=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def generate_jti() -> str:
    """Generate a unique JTI for session tracking"""
    return secrets.token_urlsafe(32)

