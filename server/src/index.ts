import { leerConfig } from './config';
import { crearServidor } from './servidor';

const config = leerConfig();
const { http } = crearServidor(config);

http.listen(config.puerto, () => {
  console.log(`Servidor de trivia en http://localhost:${config.puerto}`);
  console.log(`Orígenes permitidos: ${config.origenesPermitidos.join(', ')}`);
});
