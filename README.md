# WebMovil-Taller2

## Grupo 7: Integrantes

Denzel Delgado Urquieta, 21.401.250-2
    
Darwin Tapia Urrutia, 21.599.630-1

Juan Ignacio Castro, 21.219.278-3

Martin Adones Tapia, 21.293.739-8

## Prerrequisitos
- Apache Cordova
- Node.js
- Python
- PostgreSQL

## BD Utilizada
- SQLite (api-fastapi)
- PostgreSQL (api-express)

## Recurso que cubre cada API
- (api-fastapi): Proporciona datos del clima en http://localhost:8000
- (api-express): Proporciona noticias en http://localhost:3000
- (api-nestjs) :

## Ejecutar API-FASTAPI
1° Navegar a la carpeta api-fastapi
```bash
cd api-fastapi
```
2° Ejecutar el siguiente comando
```bash
python -m pip install -r requerimientos.txt
```
3° Ejecutarlo completamente
```bash
python main.py
```

Luego se deja la terminal abierta para que el servidor esté corriendo

## Ejecutar API-EXPRESS

1° Instalar dependencias en la carpeta news-api-express
```bash
npm install
```
2° Configurar base de datos (Crear .env)
```bash
DB_USER=tu_usuario_postgres
DB_HOST=localhost
DB_DATABASE=news_api
DB_PASSWORD=tu_contraseña_secreta
DB_PORT=5432
```
3° Preparar tabla en la base de datos
```bash
CREATE TABLE noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR(255),
    noticia_url VARCHAR(255) NOT NULL,
    keywords TEXT[],
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
4° Ejecutar la api en modo desarrollo
```bash
npm run start:dev
```

Se debe dejar la terminal abierta para que el servidor siga corriendo. La API estará disponible en http://localhost:3000.

## Ejecutar API-NESTJS
