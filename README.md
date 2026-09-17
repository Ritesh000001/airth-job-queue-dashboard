
# Mini Job Queue Dashboard

A full-stack job queue dashboard built with **React + TypeScript + Tailwind CSS** on the frontend and **NestJS + TypeORM + PostgreSQL** on the backend.

The application allows users to create jobs, monitor their status, update job states through controlled transitions, filter jobs, and delete jobs. Job data is persisted in PostgreSQL.

## Live Demo

* **Frontend:** https://airth-job-queue-dashboard-seven.vercel.app/
* **Backend API:** https://airth-job-queue-api-06ep.onrender.com
* **GitHub:** https://github.com/Ritesh000001/airth-job-queue-dashboard

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Fetch API

### Backend

* NestJS
* TypeScript
* TypeORM
* PostgreSQL
* Neon PostgreSQL
* class-validator
* class-transformer

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: Neon PostgreSQL

## Features

* Create a new job
* View all jobs
* Filter jobs by status
* Update job status
* Delete jobs
* Display job counts by status
* Persistent PostgreSQL storage
* Client-side loading and error states
* Request validation on the backend
* CORS configuration for frontend/backend communication
* Controlled job status transitions
* Database-level conditional update for safe `pending → running` transitions

## Job Status Flow

Jobs follow a controlled lifecycle:

```text
pending
   ↓
running
  ↙ ↘
completed  failed
```

Allowed transitions:

* `pending → running`
* `running → completed`
* `running → failed`

Terminal states:

* `completed` cannot transition to another state
* `failed` cannot transition to another state

The backend validates these transitions, so invalid state changes cannot be performed by bypassing the frontend.

## Concurrency Handling

The backend protects the `pending → running` transition against near-simultaneous requests.

Instead of simply reading the current status and then saving the new status, the backend performs a conditional database update:

```sql
UPDATE jobs
SET status = 'running'
WHERE id = :id
  AND status = 'pending';
```

The update result is checked to make sure exactly one row was affected.

If another request has already changed the job from `pending`, the second request does not overwrite the newer state and receives a conflict response.

This keeps the state transition consistent even when multiple requests attempt to start the same job at nearly the same time.

## Project Structure

```text
airth-job-queue-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── dto/
│   │   │   ├── job.entity.ts
│   │   │   ├── job-status.enum.ts
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.module.ts
│   │   │   └── jobs.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── ...
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Local Setup

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL database

A hosted PostgreSQL database such as Neon can also be used.

### 1. Clone the repository

```bash
git clone https://github.com/Ritesh000001/airth-job-queue-dashboard.git
cd airth-job-queue-dashboard
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

The backend `package.json` contains all required backend dependencies.

### 3. Configure backend environment variables

Create a `.env` file inside the `backend` directory.

Use `.env.example` as the template:

```env
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Replace `DATABASE_URL` with your PostgreSQL connection string.

### 4. Start the backend

```bash
npm run start:dev
```

The backend will run on:

```text
http://localhost:3000
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

The frontend `package.json` contains all required frontend dependencies.

### 6. Configure frontend environment variables

Create a `.env` file inside the `frontend` directory.

Use `.env.example` as the template:

```env
VITE_API_URL=http://localhost:3000
```

### 7. Start the frontend

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## API Documentation

Base URL:

```text
https://airth-job-queue-api-06ep.onrender.com
```

### Create Job

```http
POST /jobs
```

Request body:

```json
{
  "title": "Generate Monthly Report",
  "type": "report"
}
```

A newly created job starts with:

```text
pending
```

### Get All Jobs

```http
GET /jobs
```

Returns all jobs ordered by creation time, newest first.

### Update Job Status

```http
PATCH /jobs/:id/status
```

Request body:

```json
{
  "status": "running"
}
```

Supported statuses:

```text
pending
running
completed
failed
```

The backend rejects invalid status transitions.

### Delete Job

```http
DELETE /jobs/:id
```

Deletes the job with the specified ID.

### Error Handling

The backend uses HTTP errors for invalid requests, including:

* `400 Bad Request` — validation errors
* `404 Not Found` — job does not exist
* `409 Conflict` — invalid status transition or concurrent state change

## Data Model

Each job contains:

| Field         | Type      | Description           |
| ------------- | --------- | --------------------- |
| `id`        | UUID      | Unique job identifier |
| `title`     | string    | Job title             |
| `type`      | string    | Job type              |
| `status`    | enum      | Current job status    |
| `createdAt` | timestamp | Job creation time     |

## Validation

Backend request validation is implemented using `class-validator`.

For job creation:

* `title` must be a non-empty string
* `title` has a maximum length of 150 characters
* `type` must be a non-empty string
* `type` has a maximum length of 80 characters

Status updates are restricted to the defined `JobStatus` enum.

Unknown request properties are rejected using NestJS `ValidationPipe` with:

* `whitelist`
* `forbidNonWhitelisted`
* `transform`

## Assumptions and Tradeoffs

### Database

PostgreSQL was selected instead of SQLite because the application is deployed and requires persistent storage in a hosted environment.

### TypeORM Synchronization

During development, TypeORM synchronization is enabled to simplify schema creation:

```text
synchronize = true
```

For production, synchronization is disabled.

For a larger production application, database migrations would be preferred for controlled schema changes.

### Authentication

Authentication was outside the scope of the assignment, so the dashboard currently does not require user authentication.

### Job Processing

This assignment focuses on the dashboard and job state management. Jobs are not connected to a separate background worker or message broker.

The status transitions represent the job lifecycle managed through the API.

## Production-Ready Improvement

A natural production improvement would be to introduce a **real background job queue**, such as Redis + BullMQ.

Instead of changing a job status directly from the dashboard, the backend could:

1. Create the job in `pending` state.
2. Add the job to a background queue.
3. Let a worker process the job asynchronously.
4. Change the state to `running`.
5. Mark it `completed` or `failed` based on the processing result.
6. Add retry and backoff handling for temporary failures.

This would separate job processing from the API server and make the system more suitable for larger workloads.

## Future Improvements

* Add authentication and authorization
* Add pagination for large job lists
* Add real-time status updates using WebSockets or Server-Sent Events
* Add background workers with BullMQ/Redis
* Add automated tests for status transitions and concurrency
* Add database migrations
* Add job retry functionality
* Add structured logging and monitoring
* Add CI/CD checks for linting, testing, and builds

## Running Tests

Backend tests can be run with:

```bash
cd backend
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:cov
```

## Build

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm run build
```

## Environment Variables

Never commit actual environment files containing secrets.

The repository provides example files:

```text
backend/.env.example
frontend/.env.example
```

Actual `.env` files are excluded through `.gitignore`.

## License

This project was created as part of a technical assignment for a React + NestJS Intern position.
