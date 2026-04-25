# Jenkins + GitHub Webhook Setup

This project includes a Docker-based Jenkins pipeline in `Jenkinsfile`.

Important: GitHub webhooks trigger Jenkins on `git push`, not on a local `git commit`. The normal flow is:

```bash
git add .
git commit -m "Add Docker and Jenkins pipeline"
git push origin main
```

GitHub sends the push event to Jenkins, Jenkins checks out the repo, builds the app, builds Docker images, starts the Docker Compose stack, and smoke-tests the frontend/API.

## Jenkins Job

1. Open Jenkins: `http://localhost:9090`.
2. Create a new item.
3. Select `Pipeline` or `Multibranch Pipeline`.
4. For a simple Pipeline job:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/GKartikey/Score.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
5. Enable `GitHub hook trigger for GITScm polling`.
6. Save.

## ngrok for App + Jenkins Webhook

GitHub must reach Jenkins from the internet. This project routes `/github-webhook/` through the Docker nginx frontend to Jenkins on `localhost:9090`, so one ngrok tunnel can expose both the app and the webhook endpoint.

```bash
ngrok http 8081
```

Copy the public HTTPS forwarding URL:

- App URL: `https://your-ngrok-domain/`
- GitHub webhook URL: `https://your-ngrok-domain/github-webhook/`

Example:

```text
https://example.ngrok-free.app/github-webhook/
```

## GitHub Webhook

1. Open your GitHub repository.
2. Go to `Settings` > `Webhooks` > `Add webhook`.
3. Payload URL: your ngrok Jenkins URL ending in `/github-webhook/`.
4. Content type: `application/json`.
5. Events: `Just the push event`.
6. Active: checked.
7. Save.

## Local Docker Run

```bash
docker compose up --build
```

Open the Dockerized app:

```text
http://localhost:8081
```

API health:

```text
http://localhost:5000/api/health
```
