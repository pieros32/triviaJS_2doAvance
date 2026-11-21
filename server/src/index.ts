import { crearApp } from './app';
import { leerConfig } from './config';
import { Repositorio } from './datos/repositorio';
import { AlmacenRanking } from './ranking/almacen';

const config = leerConfig();
const app = crearApp({
  config,
  repositorio: Repositorio.desdeArchivo(config.archivoDatos),
  ranking: new AlmacenRanking(config.archivoRanking)
});

app.listen(config.puerto, () => {
  console.log(`Servidor de trivia en http://localhost:${config.puerto}`);
  console.log(`Orígenes permitidos: ${config.origenesPermitidos.join(', ')}`);
});
