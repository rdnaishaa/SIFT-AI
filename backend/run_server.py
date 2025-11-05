"""
Script untuk menjalankan FastAPI server dengan event loop policy yang benar untuk Windows
"""
import asyncio
import sys

# PENTING: Set event loop policy SEBELUM mengimport apapun
if sys.platform == 'win32':
    # Gunakan WindowsProactorEventLoopPolicy untuk Python 3.8+
    # Ini mendukung subprocess di Windows
    from asyncio import WindowsProactorEventLoopPolicy
    asyncio.set_event_loop_policy(WindowsProactorEventLoopPolicy())
    print("✓ Windows ProactorEventLoop policy set (supports subprocess)")

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "FastAPI.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload untuk menghindari issue dengan event loop
        loop="asyncio"
    )
