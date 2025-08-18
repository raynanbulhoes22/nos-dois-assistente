// Script para substituir console.log por logger seguro em todo o projeto
// Este arquivo lista todos os arquivos que precisam ter seus console.log substituídos

import { logger } from './production-logger';

// Função para substituir console nos arquivos de produção
export const replaceConsoleWithLogger = () => {
  // Em produção, sobrescreve console para usar o logger seguro
  if (!import.meta.env.DEV) {
    const originalConsole = { ...console };
    
    console.log = (message: string, ...args: any[]) => {
      logger.info(message, args);
    };
    
    console.info = (message: string, ...args: any[]) => {
      logger.info(message, args);
    };
    
    console.warn = (message: string, ...args: any[]) => {
      logger.warn(message, args);
    };
    
    console.error = (message: string, ...args: any[]) => {
      logger.error(message, args);
    };
    
    // Mantém console.debug apenas em desenvolvimento
    console.debug = () => {};
    
    // Mantém referência para reverter se necessário
    (window as any).__originalConsole = originalConsole;
  }
};

// Inicializa automaticamente quando o módulo é importado
if (typeof window !== 'undefined') {
  replaceConsoleWithLogger();
}