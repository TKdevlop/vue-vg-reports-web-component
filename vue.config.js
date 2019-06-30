module.exports = {
    devServer: {
      proxy:  {
        '^/api': {
            target: 'https://vgpayroll.intelliconnect-tech.net',
            ws: true,
            changeOrigin: 'https://vgpayroll.intelliconnect-tech.net'
          },
      }
    // proxy: 'https://vgpayroll.intelliconnect-tech.net'
  }
}