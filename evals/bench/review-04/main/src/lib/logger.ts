export const logger = {
  info: (message: string, fields: Record<string, unknown> = {}) => console.log(message, fields),
  error: (message: string, fields: Record<string, unknown> = {}) => console.error(message, fields),
};
