# Dockerfile for Python/Flask backend
# Supports both development and production modes

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install gunicorn for production (if not in requirements.txt)
RUN pip install --no-cache-dir gunicorn || true

# Copy application code
COPY . .

# Expose port (backend runs on 8080 in Docker, 5050 locally)
EXPOSE 8080

# Set port for Docker
ENV PORT=8080
ENV FLASK_PORT=8080

# Default to development mode
# Override CMD in docker-compose for production
CMD ["python", "app.py"]

