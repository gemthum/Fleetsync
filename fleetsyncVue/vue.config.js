const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  devServer: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
};