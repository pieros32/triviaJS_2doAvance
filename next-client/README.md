# Cliente Next.js (versión individual)

Trivia para un jugador con **Next.js 16 (Pages Router) + React 19 + TypeScript**. Habla con el mismo servidor Express que la versión Vue.

## Ejecutar

Desde la raíz del repositorio, en dos terminales:

```bash
npm install
npm run dev:server    # http://localhost:4000
npm run dev:next      # http://localhost:3000
```

Para la versión de producción, **enciende primero el servidor** y luego `npm run build:next` y `npm start -w next-client`: la página de inicio se genera con las franquicias que Express tenga en ese momento. La URL del servidor se cambia con `NEXT_PUBLIC_API_URL` (ver `.env.example`).

## Estructura

```
pages/
  _app.tsx                       Marco común + estado de la partida
  _document.tsx                  <html>, idioma y fuentes
  index.tsx                      Inicio (generación estática, getStaticProps)
  jugar/[franquicia]/[nivel].tsx Juego (ruta dinámica)
  resultado.tsx                  Resultado
  ranking.tsx                    Ranking (renderizado en servidor, getServerSideProps)
  404.tsx                        Página no encontrada
components/  context/  hooks/  lib/  styles/
```

## Cómo se relaciona con el PowerPoint de la semana 16

| En el PowerPoint | En este proyecto |
|---|---|
| Next.js es un framework para React | React 19 con hooks (`useState`, `useEffect`, `useReducer`, `useContext`) |
| Páginas y rutas por archivos en la carpeta `pages` | `pages/` con el Pages Router, igual que en los ejemplos |
| Ruta dinámica | `pages/jugar/[franquicia]/[nivel].tsx` (`/jugar/dragon-ball/facil`) |
| Generación de sitios estáticos (SSG) | `index.tsx` con `getStaticProps`: la lista de franquicias se genera una vez y se renueva cada hora |
| Renderizado del lado del servidor (SSR) | `ranking.tsx` con `getServerSideProps`: el ranking llega ya renderizado en cada visita |
| Ejemplo con `useState` y un input controlado | `FormularioInicio.tsx` |
| Servicio REST consumido con Axios (diapositiva 14) | `lib/api.ts` |
| Comparación Vue y Next: enrutamiento por archivos frente a Vue Router | Las rutas de aquí no se declaran, salen de los nombres de archivo |

### Lo que no se usa del PowerPoint, y por qué

- **API Routes (`pages/api`):** el backend es Express, que es justo lo que se estudia en la semana 17. Duplicar endpoints en Next no aportaría nada.
- **Imágenes optimizadas (`next/image`):** las imágenes las sirve Express desde otro origen; se usa `<img>` normal.
- **`create-next-app`:** el proyecto se armó a mano dentro del monorepo; el resultado es el mismo.
