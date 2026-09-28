import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'

const getCommitInfo = () => {
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim()
    const date = execSync('git log -1 --format="%cd" --date=format:"%d/%m/%Y"').toString().trim()
    return { hash, date }
  } catch {
    const hash = (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || 'latest'
    return { hash, date: '' }
  }
}

const commitInfo = getCommitInfo()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitInfo.hash),
    __COMMIT_DATE__: JSON.stringify(commitInfo.date),
  },
})
