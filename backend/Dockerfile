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

# 3. Setup folder kerja
WORKDIR /app

# 4. Copy requirements dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy seluruh code backend
COPY . .

# 6. Expose port (Railway will inject PORT env var)
EXPOSE 8080

# 7. Jalankan aplikasi
# Railway akan inject PORT variable, default ke 8080 jika tidak ada
CMD uvicorn FastAPI.main:app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers --forwarded-allow-ips='*'
