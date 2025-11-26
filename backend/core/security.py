# backend/app/core/security.py
import hashlib
import secrets
from typing import Union

def hash_password(password: str) -> str:
    """
    Hashear contraseña usando SHA-256 con salt
    Returns: salt$hash
    """
    try:
        if not password:
            raise ValueError("La contraseña no puede estar vacía")
            
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}${password_hash}"
        
    except Exception as e:
        raise Exception(f"Error al hashear la contraseña: {str(e)}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verificar contraseña hasheada
    Returns: True si la contraseña coincide, False en caso contrario
    """
    try:
        if not plain_password or not hashed_password:
            return False
            
        # ✅ VERIFICAR FORMATO DEL HASH
        if '$' not in hashed_password:
            return False
            
        salt, stored_hash = hashed_password.split('$')
        
        # ✅ VERIFICAR LONGITUD DEL SALT Y HASH
        if len(salt) != 32 or len(stored_hash) != 64:
            return False
            
        password_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        return secrets.compare_digest(password_hash, stored_hash)
        
    except Exception:
        # En caso de cualquier error, retornar False por seguridad
        return False

# ✅ FUNCIÓN ADICIONAL PARA MIGRACIÓN FUTURA A BCRYPT
def is_bcrypt_hash(hashed_password: str) -> bool:
    """Verificar si un hash es de tipo bcrypt"""
    return hashed_password.startswith('$2b$') or hashed_password.startswith('$2a$')