import type { NextConfig } from 'next';

const config: NextConfig = {
  // El paquete compartido se publica como TypeScript sin compilar: Next debe transpilarlo
  transpilePackages: ['@trivia/shared']
};

export default config;
