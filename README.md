# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life.
Covey.Town was built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/), and is designed to be reused across semesters.
You can view our reference deployment of the app at [app.covey.town](https://app.covey.town/), and our project showcase ([Fall 2022](https://neu-se.github.io/CS4530-Fall-2022/assignments/project-showcase), [Spring 2022](https://neu-se.github.io/CS4530-Spring-2022/assignments/project-showcase), [Spring 2021](https://neu-se.github.io/CS4530-CS5500-Spring-2021/project-showcase)) highlight select student projects.

![Covey.Town Architecture](docs/covey-town-architecture.png)

The figure above depicts the high-level architecture of Covey.Town.
The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react). Twilio's React Starter App is packaged and reused under the Apache License, 2.0.

A backend service (in the `townService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns.

## Development (local npm workflow)

Use Node `18.x` and npm `9.x` for local development.

1. Install dependencies and generate code:
   ```bash
   cd shared && npm install
   cd ../townService && npm install && npm run prestart
   cd ../frontend && npm install && npm run client
   ```
2. Configure local env files:
   - `townService/.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_API_AUTH_TOKEN` (optional: `DEMO_TOWN_ID`)
   - `frontend/.env`: `NEXT_PUBLIC_TOWNS_SERVICE_URL=http://localhost:8081`
3. Start both services in development mode (hot reload):
   ```bash
   cd townService && npm start
   cd frontend && npm start
   ```

This repository currently ships `docker-compose.prod.yml` for production-style containers; use the npm commands above for day-to-day development.

## Production deployment with Docker Compose

Production deployments should use prebuilt images from GHCR. On resource-limited VPS hosts, pull and run images instead of building on the server.

1. From the repository root, create `.env` with required backend secrets:
   ```env
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_API_KEY_SID=SK...
   TWILIO_API_KEY_SECRET=...
   TWILIO_API_AUTH_TOKEN=...
   # Optional:
   DEMO_TOWN_ID=
   ```
2. On the VPS, authenticate and deploy:
   ```bash
   docker login ghcr.io
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```

If you publish images yourself, build and push from your build machine (example PowerShell):

```powershell
docker build `
  -f Dockerfile.townService `
  -t ghcr.io/zigzag1001/covey-town-townservice:latest `
  .

docker build `
  -f Dockerfile.frontend `
  --build-arg NEXT_PUBLIC_TOWNS_SERVICE_URL=https://api.covey.001201.xyz `
  -t ghcr.io/zigzag1001/covey-town-frontend:latest `
  .

docker push ghcr.io/zigzag1001/covey-town-townservice:latest
docker push ghcr.io/zigzag1001/covey-town-frontend:latest
```

`NEXT_PUBLIC_TOWNS_SERVICE_URL` is a frontend build-time value; set it to the public HTTPS API URL (for example, `https://api.covey.001201.xyz`) before building/publishing the frontend image.

Use HTTPS for browser camera/microphone access. If you use separate frontend/API subdomains, point both DNS records to the VPS and terminate TLS at Caddy (or another reverse proxy). In that setup, only ports `80/443` should be publicly exposed; frontend/backend container ports stay internal.
