import 'reflect-metadata';
import express from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { pool } from './db'; // <-- 1. IMPORTAMOS EL POOL

// 1. Crear la aplicación de Express
const app = express();
const port = 3001; // Cambio a 3001 para evitar conflicto con NestJS en 3000

// 2. Middleware para que Express entienda JSON
app.use(express.json());

// 3. Un "Hola" en la raíz
app.get('/', (req, res) => {
  res.send('Hola, esto funciona.');
});

// 4. AQUÍ ESTÁ TU API: Crear una noticia (POST /noticias)
app.post('/noticias', async (req, res) => {
  
  // 1. Validar (¡Esto sigue igual!)
  const noticiaDto = plainToInstance(CreateNoticiaDto, req.body);
  const errors = await validate(noticiaDto);

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Error de validación',
      errors: errors.map(err => err.constraints),
    });
  }

  // 2. Guardar en la base de datos (PostgreSQL)
  try {
    // Desestructuramos los datos del DTO (en camelCase)
    const { titulo, descripcion, imagenUrl, noticiaUrl, keywords } = noticiaDto;

    // Consulta SQL parametrizada (en snake_case, como la tabla)
    // Usamos $1, $2, etc. para evitar Inyección SQL
    const query = `
      INSERT INTO noticias (titulo, descripcion, imagen_url, noticia_url, keywords)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *; 
    `;
    // (RETURNING * hace que la BBDD nos devuelva la fila que acaba de crear)

    // El orden de este array DEBE coincidir con los $1, $2...
    const values = [titulo, descripcion, imagenUrl, noticiaUrl, keywords];

    // 3. Ejecutar la consulta
    const result = await pool.query(query, values);

    // 4. Devolver la noticia recién creada desde la BBDD
    res.status(201).json({
      message: 'Noticia creada y guardada en la BBDD',
      data: result.rows[0], // result.rows[0] es la noticia creada
    });

  } catch (dbError) {
    // Si algo falla con la BBDD (ej. la tabla no existe)
    console.error('Error al guardar en la base de datos:', dbError);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS noticias (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        imagen_url TEXT,
        noticia_url TEXT NOT NULL,
        keywords TEXT[] NOT NULL
      );
    `);
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM noticias');
    const count = result.rows[0]?.count ?? 0;
    if (count === 0) {
      const query = `
        INSERT INTO noticias (titulo, descripcion, imagen_url, noticia_url, keywords)
        VALUES ($1, $2, $3, $4, $5);
      `;
      const values = [
        'Demo: Bienvenido a InfoMóvil',
        'Esta es una noticia inicial creada automáticamente al arrancar el servidor.',
        'https://via.placeholder.com/800x400?text=Noticia+Inicial',
        'https://ejemplo.com/noticia-inicial',
        ['inicio', 'demo', 'infomovil']
      ];
      await pool.query(query, values);
      console.log('Seed: noticia inicial creada.');
    } else {
      console.log(`Seed: la tabla noticias ya tiene ${count} registros.`);
    }
  } catch (err: any) {
    if (err && err.code === 'ECONNREFUSED') {
      console.warn('Seed omitido: PostgreSQL no disponible en 127.0.0.1:5432');
      return;
    }
    console.error('Fallo al inicializar la base de datos:', err);
  }
}

initDb().finally(() => {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
});