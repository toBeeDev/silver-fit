export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  success(message: string): void;
}

export function createLogger(): Logger {
  const ts = () => new Date().toISOString().substring(11, 19);

  return {
    info(msg) {
      console.log(`[${ts()}] INFO  ${msg}`);
    },
    warn(msg) {
      console.warn(`[${ts()}] WARN  ${msg}`);
    },
    error(msg) {
      console.error(`[${ts()}] ERROR ${msg}`);
    },
    success(msg) {
      console.log(`[${ts()}] OK    ${msg}`);
    },
  };
}
