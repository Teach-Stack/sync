import { defineNitroConfig } from 'nitropack/config'

// https://nitro.build/config
export default defineNitroConfig({
  compatibilityDate: 'latest',
  srcDir: 'server',
  experimental: {
    database: true,
  },
  cloudflare: {
    deployConfig: true,
    wrangler: {
      name: 'teachstack-auth',
      observability: {
        enabled: true,
      },
      d1_databases: [
        {
          binding: 'DB',
          database_name: 'teachstack-auth',
          database_id: '',
          migrations_dir: './migrations',
        },
      ],
      routes: [
        {
          pattern: 'auth.teachstack.org',
          custom_domain: true,
        },
      ],
    },
  },
  database: {
    default: {
      connector: 'cloudflare-d1',
      options: {
        bindingName: 'DB',
      },
    },
  },
  devDatabase: {
    default: {
      connector: 'sqlite',
      options: {
        name: 'db',
      },
    },
  },
})
