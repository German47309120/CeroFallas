import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          groups: [
            {
              name: 'firebase-firestore',
              test: /node_modules[\\/](?:@firebase[\\/]firestore|@firebase[\\/]webchannel-wrapper)/,
              priority: 40,
              includeDependenciesRecursively: false,
            },
            {
              name: 'firebase-auth',
              test: /node_modules[\\/]@firebase[\\/]auth/,
              priority: 35,
              includeDependenciesRecursively: false,
            },
            {
              name: 'firebase-platform',
              test: /node_modules[\\/](?:@firebase|firebase)[\\/]/,
              priority: 30,
              includeDependenciesRecursively: false,
            },
            {
              name: 'react-platform',
              test: /node_modules[\\/](?:react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              priority: 20,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
})
