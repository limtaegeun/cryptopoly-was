module.exports = {
  apps: [
    {
      name: "cryptopoly-was",
      script: "./bin/www",
      watch: false,
      interpreter: "babel-node",
      interpreter_args: "--presets @babel/preset-env",
      env: {
        PORT: 3001,
        NODE_ENV: "development"
      },
      env_test: {
        PORT: 3000,
        NODE_ENV: "test"
      },
      env_production: {
        PORT: 3000,
        NODE_ENV: "production"
      }
    }
  ]
};