module.exports = {
  presets: [
    '@vue/app',
  ],
  plugins: [
    'jsx-v-model',
    ['component', { libraryName: 'element-ui', styleLibraryName: 'theme-chalk', style: 'css' }],
    ['import', { libraryName: 'ant-design-vue', libraryDirectory: 'es', style: 'css' }], // `style: true` 会加载 less 文件
  ],
};
