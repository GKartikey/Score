# Docker Usage

The app is Dockerized as three services:

- `client`: React production build served by nginx on port `8081`.
- `server`: Express API on port `5000`.
- `mongo`: MongoDB database on port `27017`.

Run everything:

```bash
docker compose up --build
```

Stop everything:

```bash
docker compose down
```

Remove containers and Mongo volume:

```bash
docker compose down -v
```

The Docker frontend uses `/api` and nginx proxies those requests to the server container.
