FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN apt-get update && apt-get install -y build-essential \
  && pip install --no-cache-dir -r requirements.txt \
  && apt-get remove -y build-essential && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 3000
# change "main:app" to your module:app callable
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:3000"]