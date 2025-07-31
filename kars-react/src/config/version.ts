export const APP_VERSION = '0.4.0';
export const BUILD_DATE = new Date().toISOString();
export const ENVIRONMENT = import.meta.env.MODE || 'development';

export const VERSION_INFO = {
  version: APP_VERSION,
  buildDate: BUILD_DATE,
  environment: ENVIRONMENT,
  name: 'Kars.ad',
  description: 'Plataforma de compra-venda de vehicles a Andorra'
};