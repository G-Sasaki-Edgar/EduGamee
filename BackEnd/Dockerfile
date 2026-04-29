# Usamos slim para mantener la imagen ligera
FROM python:3.14-slim

# Evita que Python genere archivos .pyc y permite que los logs salgan directo a la consola
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalamos dependencias del sistema necesarias para mysqlclient
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    gcc \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Corregimos el nombre a plural (requirements.txt) que es el estándar
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Exponemos el puerto de Django
EXPOSE 8000

# Usamos manage.py para levantar el servidor de desarrollo
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]