module.exports = {
  apps: [
    {
      name: 'lms-app',
      script: 'server/index.ts',
      interpreter: 'node',
      interpreter_args: '-r tsx',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
