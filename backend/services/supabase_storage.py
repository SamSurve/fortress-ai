import os
import requests
from fastapi import HTTPException
from config import settings

def upload_file_to_supabase(bucket: str, filename: str, data: bytes) -> str:
    """Upload a file to Supabase Storage.
    Returns the storage path used (bucket/filename)."""
    if not bucket:
        raise HTTPException(status_code=500, detail="Supabase bucket not configured")
    url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{filename}"
    headers = {"Authorization": f"Bearer {settings.SUPABASE_KEY}", "Content-Type": "application/octet-stream"}
    response = requests.put(url, headers=headers, data=data)
    if response.status_code not in (200, 201, 202):
        raise HTTPException(status_code=500, detail=f"Supabase upload failed: {response.text}")
    return f"{bucket}/{filename}"

def download_file_from_supabase(bucket: str, filename: str) -> bytes:
    """Download a file from Supabase Storage and return its bytes."""
    url = f"{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{filename}"
    headers = {"Authorization": f"Bearer {settings.SUPABASE_KEY}"}
    response = requests.get(url, headers=headers, stream=True)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Supabase file not found")
    return response.content
