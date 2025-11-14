import os
from dotenv import load_dotenv
import asyncpg
from typing import Optional

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

class Database:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Membuat connection pool ke database"""
        if not self.pool:
            self.pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            print("✅ Database connection pool created")
    
    async def disconnect(self):
        """Menutup connection pool"""
        if self.pool:
            await self.pool.close()
            print("❌ Database connection pool closed")
    
    async def fetch_one(self, query: str, *args):
        """Fetch single row"""
        async with self.pool.acquire() as connection:
            return await connection.fetchrow(query, *args)
    
    async def fetch_all(self, query: str, *args):
        """Fetch multiple rows"""
        async with self.pool.acquire() as connection:
            return await connection.fetch(query, *args)
    
    async def execute(self, query: str, *args):
        """Execute query (INSERT, UPDATE, DELETE)"""
        async with self.pool.acquire() as connection:
            return await connection.execute(query, *args)
    
    async def fetch_val(self, query: str, *args):
        """Fetch single value"""
        async with self.pool.acquire() as connection:
            return await connection.fetchval(query, *args)

# Instance global database
db = Database()
