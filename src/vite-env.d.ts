/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of deployed app (e.g. https://your-app.vercel.app) — required for Capacitor so /api hits your server */
  readonly VITE_API_ORIGIN?: string
}
