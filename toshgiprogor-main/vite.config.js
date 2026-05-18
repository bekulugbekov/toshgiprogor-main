import { defineConfig } from 'vite'
import { resolve } from 'path'

const root = resolve(__dirname)

export default defineConfig({
  root,
  base: '/',
  build: {
    outDir: resolve(root, 'dist'),
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        index:                resolve(root, 'index.html'),
        about:                resolve(root, 'about.html'),
        services:             resolve(root, 'services.html'),
        projects:             resolve(root, 'projects.html'),
        blog:                 resolve(root, 'blog.html'),
        'blog-details':       resolve(root, 'blog-details.html'),
        contact:              resolve(root, 'contact.html'),
        'corporate-management': resolve(root, 'corporate-management.html'),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
