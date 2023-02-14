# W3bstream Studio

- Managing your W3bstream node
- Code and deploy Wasm Applets
- Publisher management
- Test events
- Logs viewer


### DEV

```bash
cp .env.tmpl .env

pnpm install
pnpm dev
```

### Deploy

```bash
pnpm build; pnpm start
```

### Build Image

```bash
docker build -f Dockerfile -t test/w3bstream-studio:main .
```


## Documentation

Please visit [https://docs.w3bstream.com/](https://docs.w3bstream.com/).

Interested in contributing to the doc? Please edit on [Github](https://github.com/machinefi/w3bstream-docs-gitbook) 


## Arch

## Run W3bstream node with prebuilt docker images

Make a path for w3bstream node. In the path, run the following command

```bash
curl https://raw.githubusercontent.com/machinefi/w3bstream-studio/main/docker-compose.yaml > docker-compose.yaml
```

Edit the config in the `yaml` file if needed. Then run

```bash
docker-compose -p w3bstream -f ./docker-compose.yaml up -d
```

Your node should be up and running. 

Please note: the docker images are hosted at [GitHub Docker Registry](https://github.com/machinefi/w3bstream/pkgs/container/w3bstream)
