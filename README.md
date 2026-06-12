# Console UI

The root administrative dashboard for securely managing the developer platform.

[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## Overview

The Console UI acts as the secure entry point and primary access dashboard for the platform. Designed for platform administrators, it interfaces with the `gateway` API to provide login mechanisms, manage securely generated API keys (`pk_...`), and act as a central hub to navigate to other internal applications like the Portfolio Manager.

## Architecture & Tech Stack

- **Framework**: Built with React 19 and compiled using Vite for instantaneous hot-module replacement (HMR) and optimized production bundles.
- **Package Manager**: Managed and executed using `bun` for maximum speed.
- **Styling**: Fully styled with Tailwind CSS v4, utilizing `shadcn` tooling alongside `@base-ui/react` primitives.
- **State & Data Fetching**: Relies on `@tanstack/react-query` for asynchronous state management and `@tanstack/react-form` for complex form handling.
- **Routing**: Client-side navigation handled by React Router v7.

### Project Structure

```text
.
├── public/        # Static assets
├── src/           # React component source code
├── index.html     # Application entrypoint template
├── package.json   # Dependencies and scripts
└── vite.config.ts # Vite configuration
```

## Features

- ⚡ **Lightning Fast**: Bootstrapped with Vite and React 19 Compiler plugins for top-tier rendering performance.
- 🎨 **Modern Design**: Built using `@base-ui/react` and Tailwind CSS, with dynamic theming support (`next-themes`).
- 🔄 **Reactive Data**: Integrated with TanStack Query to provide optimistic updates, caching, and background data synchronization.
- 📝 **Type-Safe Validation**: Forms and API responses are strictly validated on the client side using `zod`.

## Platform Routing

The console maps strictly to the platform's security boundaries:
- `/login`: The secure root login page for platform administrators.
- `/secrets`: A dedicated interface to generate, view, and rotate API keys required by external portfolio frontends.
- `/apps`: A navigational hub linking to other secured platform modules (e.g., the Portfolio Manager).

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) is required to manage dependencies and run scripts efficiently.

### Configuration

The frontend relies on the following environment variables to correctly route requests to the backend gateway and cross-link to other UI portals. You should export these in your shell environment.

| Variable | Description | Required |
| :--- | :--- | :---: |
| `VITE_AUTH_API_URL` | Endpoint for the public Auth API routes | **Yes** |
| `VITE_MANAGER_API_URL` | Endpoint for the public Manager API routes | **Yes** |
| `VITE_MANAGER_URL` | Base URL of the deployed Manager UI (used for cross-portal navigation) | **Yes** |
| `VITE_MODE` | Specifies the current environment mode (e.g., `development`) | No |

### Running the Service

Install dependencies and start the Vite development server:

```bash
bun install
bun run dev
```

### Building for Production

To compile the application into static HTML/CSS/JS assets for deployment:

```bash
bun run build
```
