from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.session import get_db
from app.schemas.auth import UserCreate, UserResponse, LoginRequest, Token
from app.services.auth import (
    create_user,
    get_user_by_email,
    verify_password,
    create_access_token,
    create_session,
    generate_jti,
    decode_access_token,
)
from app.services.trading import get_portfolio
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> UserResponse:
    """Get current user from JWT token (cookie or header)"""
    token = None
    
    # Try cookie first
    token = request.cookies.get("access_token")
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return UserResponse.model_validate(user)


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db), response: Response = None):
    """Sign up a new user"""
    # Check if user exists
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = create_user(db, user_data.email, user_data.password)

    # Create portfolio
    get_portfolio(db, user.id)

    # Create access token
    jti = generate_jti()
    expires_delta = timedelta(minutes=settings.jwt_expires_min)
    access_token = create_access_token(data={"sub": user.id, "jti": jti}, expires_delta=expires_delta)
    
    # Create session
    expires_at = datetime.utcnow() + expires_delta
    create_session(db, user.id, jti, expires_at)

    # Set cookie (localhost-friendly: secure=False, no domain)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=settings.jwt_expires_min * 60,
        path="/",
    )

    return UserResponse.model_validate(user)


@router.post("/login", response_model=UserResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db), response: Response = None):
    """Log in user"""
    user = get_user_by_email(db, login_data.email)
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Create access token
    jti = generate_jti()
    expires_delta = timedelta(minutes=settings.jwt_expires_min)
    access_token = create_access_token(data={"sub": user.id, "jti": jti}, expires_delta=expires_delta)
    
    # Create session
    expires_at = datetime.utcnow() + expires_delta
    create_session(db, user.id, jti, expires_at)

    # Set cookie (localhost-friendly: secure=False, no domain)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=settings.jwt_expires_min * 60,
        path="/",
    )

    return UserResponse.model_validate(user)


@router.post("/logout")
def logout(response: Response = None):
    """Log out user"""
    response.delete_cookie(
        key="access_token",
        path="/",
        samesite="lax",
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Get current user info"""
    return current_user

