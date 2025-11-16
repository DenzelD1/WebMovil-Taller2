<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## API Monedas Virtuales (NestJS + TypeORM + SQLite)

Este proyecto incluye una API para crear, buscar y eliminar monedas virtuales usando NestJS y TypeORM. Usa **SQLite local** (archivo `webmovil.sqlite` en la carpeta del proyecto).

### Configuración

1. Copia `.env.example` a `.env` y ajusta credenciales para SQLite local:

```
DB_FILE=webmovil.sqlite
PORT=3000
```

2. Instala dependencias:

```
npm install
```

3. Levanta el servidor:

```
npm run start:dev
```


### Entidades y Campos

- `Coin`:
  - `id` (number)
  - `name` (string, único)
  - `symbol` (string, opcional, único)
  - `price` (float)
  - `trend` (enum: `up`, `down`, `stable`)
  - `imageUrl` (string, opcional)
  - `createdAt`, `updatedAt` (timestamps)

### Endpoints

- `POST /coins`
  - Body: `{ name, symbol?, price, trend, imageUrl? }`
  - Crea una moneda.

- `GET /coins`
  - Query: `q?`, `trend?`, `minPrice?`, `maxPrice?`, `limit?`
  - Lista y busca con filtros.

- `GET /coins/:id`
  - Obtiene una moneda por ID.

- `DELETE /coins/:id`
  - Elimina una moneda por ID.

### Notas

- El archivo de base de datos se crea automáticamente en la ruta indicada por `DB_FILE`.

### Datos iniciales

- Al iniciar la API por primera vez, si la tabla `coins` está vacía, se insertan automáticamente monedas de ejemplo:
  - Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Solana (SOL).
