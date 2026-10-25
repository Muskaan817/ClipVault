# ClipVault

ClipVault is a desktop clipboard manager designed for developers to capture, categorize, search, and manage copied text, code snippets, and URLs in a single place. Built with Electron, React, Express, and PostgreSQL, ClipVault keeps your clipboard history organized and easily accessible directly from your desktop.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Set Up the Database](#4-set-up-the-database)
  - [5. Run the Application](#5-run-the-application)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Future Improvements](#future-improvements)
- [Author and License](#author-and-license)

---

## Overview

Developers constantly copy and paste code blocks, API endpoints, commands, and documentation links throughout the day. Standard operating system clipboards typically store only the most recent item, leading to lost snippets and repeated context-switching.

ClipVault solves this problem by providing a persistent, local clipboard dashboard with categorization, instant real-time search, and quick desktop copy actions.

---

## Features

- **Save Clips**: Add text, code, or URLs with an optional type selector (**Text**, **Code Snippet**, **Link**).
- **One-Click Copy**: Copy saved clips back into the system clipboard via native Electron desktop integration (`window.clipVault.copyText`).
- **Pin / Unpin Clips**: Keep critical clips pinned to the top of your list for fast access.
- **Delete Clips**: Remove unwanted clips with a built-in confirmation prompt.
- **Sidebar Category Filters**: Filter clips by **All Clips**, **Pinned**, **Code Snippets**, and **Links**.
- **Real-Time Search**: Search through clip contents instantly. The search is case-insensitive, ignores leading and trailing whitespace, and works seamlessly alongside any active sidebar filter.
- **Context-Aware Empty States**: Clear, contextual messages when no clips exist, when a filter category is empty, or when a search returns zero results.
- **Friendly Error Handling**: Helpful notifications if the backend server is unreachable or if a request fails.

---

## Tech Stack

- **Desktop Framework**: Electron (`v45.0.0`)
- **Frontend**: React (`v19.3.1`), Vite (`v8.3.5`), Vanilla CSS
- **Backend**: Node.js, Express (`v5.3.0`)
- **Database**: PostgreSQL (`v14+`), `pg` driver (`v8.23.1`)
- **Utilities**: `dotenv`, `cors`, `nodemon`

---

## Project Structure

```text
ClipVault/
├── .env.example              # Template for environment variables
├── .gitignore                # Git ignore rules
├── package.json              # Root project dependencies and scripts
├── package-lock.json         # Locked dependency tree
├── backend/
│   ├── server.js             # Express application entry point & DB initialization
│   ├── db.js                 # PostgreSQL connection pool and clips table schema
│   ├── routes/
│   │   └── clipRoutes.js     # API routes for /api/clips
│   └── controllers/
│       └── clipController.js # Request handlers (CRUD, search, filtering, auto-detect)
├── electron/
│   ├── main.js               # Electron main process (window creation & IPC handlers)
│   └── preload.js            # Preload script exposing clipboard API to renderer
└── frontend/
    ├── index.html            # Main HTML document
    └── src/
        ├── main.jsx          # React DOM entry point
        ├── App.jsx           # Main UI, filtering, search, and state management
        ├── style.css         # Dark theme UI styles and action button styling
        ├── services/
        │   └── clipService.js# API service functions for backend communication
        └── components/
            ├── Sidebar.jsx   # Navigation sidebar for category filtering
            ├── PinButton.jsx # Pin/unpin toggle button component
            └── DeleteButton.jsx # Clip delete button component
```

---

## Prerequisites

Before setting up ClipVault, ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (`v20+` or `v22+` recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14.0` or higher (running locally on port `5432` or via remote connection)

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Muskaan817/ClipVault.git
cd ClipVault
```

### 2. Install Dependencies

All dependencies for the backend, frontend, and Electron desktop app are managed at the root level:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root by copying the provided `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and fill in your PostgreSQL credentials:

```env
PORT=5001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=clipvault
```

### 4. Set Up the Database

1. Ensure your PostgreSQL service is running.
2. Create the `clipvault` database:
   ```bash
   createdb -U postgres clipvault
   ```
   *(Or run `CREATE DATABASE clipvault;` inside the `psql` shell).*
3. You do **not** need to manually run migration scripts. When the backend server starts, it automatically creates the `clips` table if it does not already exist.

### 5. Run the Application

Running ClipVault requires three separate terminal windows:

#### Terminal 1 — Start the Backend Server

```bash
# From the project root:
npm start
```

*The Express API will start on `http://localhost:5001` and connect to PostgreSQL.*

> **Tip:** You can also run `npm run dev` to start the backend with `nodemon` for automatic restarts during development.

#### Terminal 2 — Start the Frontend Dev Server

```bash
# From the project root:
npx vite frontend
```

*The Vite development server will start on `http://localhost:5173`.*

> **Note on `package.json` script:** In Vite v8, passing `--root` is deprecated. If running `npm run frontend` gives a CLI argument error on your environment, use `npx vite frontend` directly.

#### Terminal 3 — Launch the Desktop App

```bash
# From the project root (after frontend is running):
npm run desktop
```

*An Electron desktop window will open and load `http://localhost:5173`.*

---

## Environment Variables

The backend reads configuration values from the `.env` file located in the root directory:

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `5001` | Port on which the Express backend server listens |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `DB_HOST` | No | `localhost` | Hostname of the PostgreSQL database |
| `DB_PORT` | No | `5432` | Port of the PostgreSQL database |
| `DB_USER` | No | `postgres` | PostgreSQL username |
| `DB_PASSWORD`| Yes | `""` | Password for the PostgreSQL user |
| `DB_NAME` | No | `clipvault` | PostgreSQL database name |
| `DATABASE_URL`| Optional | — | Complete connection string (e.g. `postgres://user:pass@host:5432/clipvault`). If provided, takes precedence over individual `DB_*` variables. |

---

## API Reference

Base URL: `http://localhost:5001/api/clips`

### Health Check

- **`GET /api/health`**
  - **Description**: Verifies that the backend server is running.
  - **Response**: `200 OK`
    ```json
    {
      "status": "ok",
      "service": "ClipVault Backend",
      "timestamp": "2026-10-25T12:00:00.000Z"
    }
    ```

### Clips Endpoints

- **`GET /api/clips`**
  - **Description**: Retrieve saved clips (ordered by pinned clips first, then newest first).
  - **Query Parameters**:
    - `q` *(string, optional)*: Search keyword to filter clips by content.
    - `pinned` *(string, optional)*: Filter by pinned status (`"true"` or `"false"`).
    - `limit` *(integer, optional, default: 50)*: Number of clips to return (1–100).
    - `offset` *(integer, optional, default: 0)*: Number of clips to skip.
  - **Response**: `200 OK`
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "content": "const greeting = 'Hello, World!';",
          "type": "code",
          "is_pinned": true,
          "created_at": "2026-10-25T10:00:00.000Z",
          "updated_at": "2026-10-25T10:00:00.000Z"
        }
      ],
      "count": 1
    }
    ```

- **`GET /api/clips/:id`**
  - **Description**: Retrieve a single clip by its numeric ID.
  - **Response**: `200 OK` on success, `404 Not Found` if the clip does not exist.

- **`POST /api/clips`**
  - **Description**: Create a new clip.
  - **Request Body**:
    ```json
    {
      "content": "https://react.dev",
      "type": "url",
      "is_pinned": false
    }
    ```
    - `content` *(string, required)*: The text, code, or URL content.
    - `type` *(string, optional)*: `"text"`, `"code"`, or `"url"`. If omitted, the backend attempts auto-detection.
    - `is_pinned` *(boolean, optional, default: `false`)*: Initial pin state.
  - **Response**: `201 Created`

- **`PUT /api/clips/:id`**
  - **Description**: Update an existing clip's content, type, or pinned status.
  - **Request Body**: At least one field is required (`content`, `type`, or `is_pinned`).
    ```json
    {
      "is_pinned": true
    }
    ```
  - **Response**: `200 OK`

- **`DELETE /api/clips/:id`**
  - **Description**: Delete a clip by its numeric ID.
  - **Response**: `200 OK`
    ```json
    {
      "success": true,
      "message": "Clip deleted successfully"
    }
    ```

- **`DELETE /api/clips`**
  - **Description**: Clear multiple clips.
  - **Query Parameters**:
    - `includePinned` *(string, optional, default: `"false"`)*: If `"true"`, deletes all clips. If `"false"`, deletes only unpinned clips.
  - **Response**: `200 OK`

---

## Future Improvements

The following features are planned for future versions of ClipVault:

- **Global Shortcut Keys**: Open the ClipVault window or paste the latest clip using configurable keyboard shortcuts.
- **Syntax Highlighting**: Add syntax coloring for code snippets (JavaScript, Python, HTML/CSS, SQL, etc.).
- **Tags and Collections**: Organize clips into custom folders or user-defined tags.
- **Export and Import**: Backup and restore saved clipboard data via JSON or CSV files.
- **Automatic Clipboard Listener**: Optional background service to automatically capture copied text from any desktop application.

---

## Author and License

- **Author**: [Muskaan](https://github.com/Muskaan817)
- **Repository**: [https://github.com/Muskaan817/ClipVault](https://github.com/Muskaan817/ClipVault)
- **License**: This project is licensed under the **ISC License** as specified in `package.json`.
