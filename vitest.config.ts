import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/modules/incidents/incident.service.test.ts'],
        exclude: [
            '**/node_modules/**',
            '**/events/**',
            '**/rag/**',
            '**/embeddings/**',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
    },
});