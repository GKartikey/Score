# Credit Risk Scoring System

MERN stack app for explainable credit risk scoring in banking and FinTech workflows. It scores borrower applications, shows the biggest risk drivers, records auditable decisions, and works with MongoDB when a connection is available.

## Features

- Borrower application form based on the trained LendingClub-style model fields.
- Explainable scoring output with risk probability, decision band, factor contributions, and compliance notes.
- Audit trail API backed by MongoDB, with in-memory fallback for local demos.
- React dashboard for portfolio metrics and recent decisions.

## Run Locally

```bash
npm run install:all
copy server\.env.example server\.env
npm run dev
```

Client: `http://localhost:5173`

Server: `http://localhost:5000`

Set `MONGODB_URI` in `server/.env` to persist audit records.

## Run With Docker

```bash
docker compose up --build
```

Docker app: `http://localhost:8081`

Docker API: `http://localhost:5000/api/health`

## Jenkins CI/CD

This repo includes a Docker-based `Jenkinsfile`. Configure a Jenkins Pipeline job from SCM and point it at this repo. The pipeline runs on GitHub push webhooks, builds the React app, builds Docker images, starts the Compose stack, smoke-tests the API/frontend, and tears the CI stack down.

Full setup notes: `docs/jenkins-github-webhook.md`

## Project Structure

```text
client/   React + Vite frontend
server/   Express + Mongoose backend
a.py      Original model training script
loan.csv  Source dataset
```
