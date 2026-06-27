# Console UI

The root administrative dashboard for managing the platform.

[![React Version](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## Overview

The console UI acts as the secure entry point and primary access dashboard for the platform. It interfaces with the `gateway` API to provide login mechanisms, manage generated API keys, and act as a central hub to navigate to other internal applications.

## Architecture

This section explains the technologies and physical layout of the console UI.

- **Framework**: Built with React 19 and compiled using Vite for hot-module replacement
- **Package manager**: Managed and executed using `bun`
- **Styling**: Styled with Tailwind CSS v4, utilizing `shadcn` tooling and `@base-ui/react` primitives
- **State**: Uses `@tanstack/react-query` for asynchronous state management and `@tanstack/react-form` for complex form handling
- **Routing**: Client-side navigation handled by React Router v8

### Project structure

- `public/`: Static assets
- `src/`: React component source code
- `index.html`: Application entrypoint template
- `package.json`: Dependencies and scripts
- `vite.config.ts`: Vite configuration

## Features

This section outlines the capabilities of the console UI.

- **Performance**: Bootstrapped with Vite and React 19 Compiler plugins for rendering performance.
- **Design**: Built using `@base-ui/react` and Tailwind CSS, with dynamic theming support.
- **Reactive data**: Uses TanStack Query to provide optimistic updates, caching, and background data synchronization.
- **Type-safe validation**: Forms and API responses validate strictly on the client side using `zod`.

## Platform routing

The console maps strictly to the platform's security boundaries:

- `/login`: The secure root login page for platform administrators
- `/secrets`: A dedicated interface to generate, view, and rotate API keys required by external portfolio frontends
- `/apps`: A navigational hub linking to other secured platform modules

## Getting started

This section explains how to run the console UI locally.

### Prerequisites

- [Bun](https://bun.sh/) to manage dependencies and run scripts

### Configuration

Export these variables directly in your shell environment:

| Variable | Description | Required |
| :--- | :--- | :---: |
| `VITE_AUTH_API_URL` | Endpoint for the public auth API routes | **Yes** |
| `VITE_MANAGER_API_URL` | Endpoint for the public manager API routes | **Yes** |
| `VITE_MANAGER_URL` | Base URL of the deployed manager UI | **Yes** |
| `VITE_MODE` | Specifies the current environment mode | No |

### Running locally

Install dependencies and start the development server:

```bash
bun install
bun run dev
```

### Build for production

Compile the application into static HTML, CSS, and JS assets for deployment:

```bash
bun run build
```
