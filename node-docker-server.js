const WebSocket = require('ws');
const Docker = require('node-docker-api').Docker;

const wss = new WebSocket.Server({ port: 9000 });

console.log('[node-docker-server] is running');

let _container;
const getContainer = async (docker, Image) => {
  if (_container) {
    return _container;
  } else {
    const containers = await docker.container.list();
    containers.forEach((item) => {
      if (item.data.Image.includes(Image)) {
        _container = item;
        return item;
      }
    });

    return _container;
  }
};
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

wss.on('connection', (ws) => {
  ws.on('message', async (msg) => {
    try {
      const { type } = JSON.parse(msg);

      if (type === 'logs') {
        const container = await getContainer(docker, 'iotex/w3bstream');
        if (container) {
          const stream = await container.logs({
            follow: true,
            stdout: true,
            stderr: true
          });
          stream.on('data', (info) => {
            const log = info.toString();
            ws.send(
              JSON.stringify({
                type: 'logs',
                data: log
              })
            );
          });
        } else {
          ws.send(
            JSON.stringify({
              type: 'logs',
              data: 'No "iotex/w3bstream" container found'
            })
          );
        }
      }
    } catch (error) {}
  });
});
