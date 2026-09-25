// Structured logs, one JSON object per line, so the log pipeline can index fields.
type Fields = Record<string, unknown>;

const write = (level: 'info' | 'warn' | 'error', message: string, fields: Fields) => {
  const line = JSON.stringify({ level, message, time: new Date().toISOString(), ...fields });
  if (level === 'error') console.error(line);
  else console.log(line);
};

export const logger = {
  info: (message: string, fields: Fields = {}) => write('info', message, fields),
  warn: (message: string, fields: Fields = {}) => write('warn', message, fields),
  error: (message: string, fields: Fields = {}) => write('error', message, fields),
};
