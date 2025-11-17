from fastapi import APIRouter, HTTPException, status, Depends
from .models import UserRegister, UserLogin, UserUpdate, TokenResponse, UserResponse, MessageResponse
from .database import db
from .auth import hash_password, verify_password, create_access_token, get_current_user
import asyncpg

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register user baru.
    
    - **username**: Username unik (3-100 karakter)
    - **email**: Email unik
    - **password**: Password (minimal 6 karakter)
    
    Returns JWT token dan informasi user.
    """
    try:
        # Cek apakah email sudah terdaftar
        existing_user = await db.fetch_one(
            "SELECT user_id FROM users WHERE email = $1",
            user_data.email
        )
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Cek apakah username sudah terdaftar
        existing_username = await db.fetch_one(
            "SELECT user_id FROM users WHERE username = $1",
            user_data.username
        )
        
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Insert user baru ke database
        new_user = await db.fetch_one(
            """
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING user_id, username, email, created_at
            """,
            user_data.username,
            user_data.email,
            hashed_password
        )
        
        # Buat JWT token
        access_token = create_access_token(
            data={
                "user_id": str(new_user["user_id"]),  # Convert UUID to string
                "email": new_user["email"],
                "username": new_user["username"]
            }
        )
        
        # Return response
        return TokenResponse(
            access_token=access_token,
            user=UserResponse(
                user_id=str(new_user["user_id"]),  # Convert UUID to string
                username=new_user["username"],
                email=new_user["email"],
                created_at=new_user["created_at"]
            )
        )
    
    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already exists"
        )
    except Exception as e:
        print(f"Error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """
    Login user yang sudah terdaftar.
    
    - **email**: Email yang terdaftar
    - **password**: Password
    
    Returns JWT token dan informasi user.
    """
    try:
        # Cari user berdasarkan email
        user = await db.fetch_one(
            """
            SELECT user_id, username, email, password_hash, created_at
            FROM users
            WHERE email = $1
            """,
            user_data.email
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verifikasi password
        if not verify_password(user_data.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Buat JWT token
        access_token = create_access_token(
            data={
                "user_id": str(user["user_id"]),  # Convert UUID to string
                "email": user["email"],
                "username": user["username"]
            }
        )
        
        # Return response
        return TokenResponse(
            access_token=access_token,
            user=UserResponse(
                user_id=str(user["user_id"]),  # Convert UUID to string
                username=user["username"],
                email=user["email"],
                created_at=user["created_at"]
            )
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Mendapatkan informasi user yang sedang login.
    
    Requires: Bearer token di header Authorization
    """
    try:
        user = await db.fetch_one(
            """
            SELECT user_id, username, email, created_at
            FROM users
            WHERE user_id = $1
            """,
            current_user["user_id"]
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            user_id=str(user["user_id"]),  # Convert UUID to string
            username=user["username"],
            email=user["email"],
            created_at=user["created_at"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting user info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )


@router.patch("/me", response_model=UserResponse)
async def update_user(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update informasi user yang sedang login.
    
    - **username**: Username baru (opsional)
    - **email**: Email baru (opsional)
    - **current_password**: Password saat ini (diperlukan untuk ganti password)
    - **new_password**: Password baru (opsional)
    
    Requires: Bearer token di header Authorization
    """
    try:
        # Validasi: jika ingin ganti password, harus kirim current_password dan new_password
        if user_data.new_password and not user_data.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to change password"
            )
        
        # Jika ada perubahan password, verifikasi current_password
        if user_data.current_password:
            user = await db.fetch_one(
                "SELECT password_hash FROM users WHERE user_id = $1",
                current_user["user_id"]
            )
            
            if not verify_password(user_data.current_password, user["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Current password is incorrect"
                )
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        param_count = 1
        
        if user_data.username:
            # Cek apakah username sudah dipakai user lain
            existing_username = await db.fetch_one(
                "SELECT user_id FROM users WHERE username = $1 AND user_id != $2",
                user_data.username,
                current_user["user_id"]
            )
            
            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
            
            update_fields.append(f"username = ${param_count}")
            update_values.append(user_data.username)
            param_count += 1
        
        if user_data.email:
            # Cek apakah email sudah dipakai user lain
            existing_email = await db.fetch_one(
                "SELECT user_id FROM users WHERE email = $1 AND user_id != $2",
                user_data.email,
                current_user["user_id"]
            )
            
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            update_fields.append(f"email = ${param_count}")
            update_values.append(user_data.email)
            param_count += 1
        
        if user_data.new_password:
            hashed_password = hash_password(user_data.new_password)
            update_fields.append(f"password_hash = ${param_count}")
            update_values.append(hashed_password)
            param_count += 1
        
        # Jika tidak ada field yang diupdate
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Add user_id to values
        update_values.append(current_user["user_id"])
        
        # Execute update query
        query = f"""
            UPDATE users
            SET {', '.join(update_fields)}
            WHERE user_id = ${param_count}
            RETURNING user_id, username, email, created_at
        """
        
        updated_user = await db.fetch_one(query, *update_values)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            user_id=str(updated_user["user_id"]),
            username=updated_user["username"],
            email=updated_user["email"],
            created_at=updated_user["created_at"]
        )
    
    except HTTPException:
        raise
    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already exists"
        )
    except Exception as e:
        print(f"Error updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )
