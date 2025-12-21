FROM python:3.11-slim

# 1. Install dependencies sistem & Chromium
# Kita butuh chromium dan driver-nya agar browser-use bisa jalan
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. Set Environment Variable
# Ini memberi tahu code python di mana letak chromium di linux
ENV CHROME_PATH=/usr/bin/chromium
ENV PORT=8000

# 3. Setup folder kerja
WORKDIR /app

# 4. Copy requirements dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy seluruh code backend
COPY . .

# 6. Jalankan aplikasi
# Menggunakan sh -c agar variable $PORT dari Railway terbaca
CMD sh -c "uvicorn FastAPI.main:app --host 0.0.0.0 --port ${PORT:-8000}"
