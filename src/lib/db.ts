import postgres from 'postgres';

export const sql = postgres(process.env.DATABASE_URL!, {
  max: process.env.NODE_ENV === 'development' ? 1 : 10,
  idle_timeout: 10,
  connect_timeout: 30,
  connection: {
    application_name: 'w3bstream'
  }
});
