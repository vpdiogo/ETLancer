import json

from cryptography.fernet import Fernet

from app.core.config import settings

_fernet = Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt_credentials(credentials: dict) -> str:
    plaintext = json.dumps(credentials).encode()
    return _fernet.encrypt(plaintext).decode()


def decrypt_credentials(ciphertext: str) -> dict:
    plaintext = _fernet.decrypt(ciphertext.encode())
    return json.loads(plaintext)
