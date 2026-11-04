import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,
    include: ['runtime/**/*.test.ts', 'editor/**/*.test.ts', 'ferramentas/**/*.test.ts', 'leitor-construct/**/*.test.ts'],
  },
})
