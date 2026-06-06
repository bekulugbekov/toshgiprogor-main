import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const root = resolve(__dirname)

export default defineConfig({
  root,
  base: '/',
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'assets/js',    dest: '.' },
        { src: 'assets/css',   dest: '.' },
        { src: 'assets/fonts', dest: '.' },
        { src: 'assets/img',   dest: '.' },
        { src: 'assets/docs',  dest: '.' },
        { src: 'assets/video', dest: '.' },
      ],
    }),
  ],
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
        cooperation:            resolve(root, 'cooperation.html'),
        privacy:                resolve(root, 'privacy.html'),
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
