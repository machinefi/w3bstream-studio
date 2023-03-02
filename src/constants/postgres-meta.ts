const PG_META_DB_SSL_MODE = process.env.PG_META_DB_SSL_MODE || 'disable';
const PG_CONN_TIMEOUT_SECS = Number(process.env.PG_CONN_TIMEOUT_SECS || 15);

export const PG_CONNECTION = `${process.env.DATABASE_URL}?sslmode=${PG_META_DB_SSL_MODE}`;
export const DEFAULT_POOL_CONFIG = { max: 1, connectionTimeoutMillis: PG_CONN_TIMEOUT_SECS * 1000 };
export const PG_META_REQ_HEADER = 'request-id';

export const DISABLED_TABLE_LIST = [
  't_account',
  't_applet',
  't_config',
  't_event_log',
  't_instance',
  't_project',
  't_publisher',
  't_resource',
  't_strategy',
  't_blockchain',
  't_chain_height',
  't_chain_tx',
  't_contract_log'
];
