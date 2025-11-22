# backend/app/core/security.py (ALTERNATIVA)
import hashlib
import secrets

def hash_password(password: str) -> str:
    """Hashear contraseña usando SHA-256 con salt (alternativa temporal)"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}${password_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña hasheada"""
    try:
        salt, stored_hash = hashed_password.split('$')
        password_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        return secrets.compare_digest(password_hash, stored_hash)
    except:
        return False