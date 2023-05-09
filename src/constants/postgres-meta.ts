const PG_META_DB_SSL_MODE = process.env.PG_META_DB_SSL_MODE || 'disable';
const PG_CONN_TIMEOUT_SECS = Number(process.env.PG_CONN_TIMEOUT_SECS || 15);

export const PG_CONNECTION = `${process.env.DATABASE_URL}?sslmode=${PG_META_DB_SSL_MODE}`;
export const DEFAULT_POOL_CONFIG = { max: 1, connectionTimeoutMillis: PG_CONN_TIMEOUT_SECS * 1000 };
export const PG_META_REQ_HEADER = 'request-id';

export const url2obj = (url: string) => {
  const pattern = /^(?:([^:\/?#\s]+):\/{2})?(?:([^@\/?#\s]+)@)?([^\/?#\s]+)?(?:\/([^?#\s]*))?(?:[?]([^#\s]+))?\S*$/;
  const matches = url.match(pattern);
  const params = {};
  if (matches[5] != undefined) {
    matches[5].split('&').map(function (x) {
      const a = x.split('=');
      params[a[0]] = a[1];
    });
  }
  return {
    protocol: matches[1],
    user: matches[2] != undefined ? matches[2].split(':')[0] : undefined,
    password: matches[2] != undefined ? matches[2].split(':')[1] : undefined,
    host: matches[3],
    hostname: matches[3] != undefined ? matches[3].split(/:(?=\d+$)/)[0] : undefined,
    port: matches[3] != undefined ? matches[3].split(/:(?=\d+$)/)[1] : undefined,
    segments: matches[4] != undefined ? matches[4].split('/') : undefined,
    params: params
  };
};

export const getDatabaseName = (projectID: string) => `w3b_${projectID}`;

export const getConnectionString = (projectID: string) => {
  const obj = url2obj(process.env.DATABASE_URL);
  return `postgresql://${obj.user}:${obj.password}@${obj.host}/${getDatabaseName(projectID)}?sslmode=${PG_META_DB_SSL_MODE}`;
};
