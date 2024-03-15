import { register } from 'node:module'

  register('./hooks/module_loader.js', import.meta.url)
