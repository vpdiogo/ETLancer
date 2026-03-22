import pytest
from cryptography.fernet import InvalidToken

from app.core.encryption import decrypt_credentials, encrypt_credentials


def test_encrypt_decrypt_roundtrip():
    original = {"api_key": "secret-123", "token": "abc"}
    encrypted = encrypt_credentials(original)
    assert encrypted != str(original)
    decrypted = decrypt_credentials(encrypted)
    assert decrypted == original


def test_decrypt_invalid_token():
    with pytest.raises(InvalidToken):
        decrypt_credentials("not-a-valid-fernet-token")


def test_encrypt_nested_dict():
    original = {
        "service_account": {
            "type": "service_account",
            "project_id": "my-project",
            "private_key": "-----BEGIN RSA PRIVATE KEY-----",
        }
    }
    encrypted = encrypt_credentials(original)
    decrypted = decrypt_credentials(encrypted)
    assert decrypted == original


def test_encrypt_empty_dict():
    original = {}
    encrypted = encrypt_credentials(original)
    decrypted = decrypt_credentials(encrypted)
    assert decrypted == original
