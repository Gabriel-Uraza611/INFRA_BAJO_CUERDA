# ---- Base image ----
FROM python:3.11-slim

# ---- Set working directory ----
WORKDIR ~/app

# ---- Install dependencies ----
# Copy only requirements first (faster builds)

COPY . .

RUN pip install --no-cache-dir -r requirements.txt
# ---- Copy application code ----

# ---- Expose port ----
EXPOSE 8000

# ---- Start Uvicorn ----
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

