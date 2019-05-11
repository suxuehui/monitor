module.exports = {
  presets: [
    '@vue/app',
  ],
  plugins: [
    'jsx-v-model',
    'lodash',
    ['component', { libraryName: 'element-ui', styleLibraryName: 'theme-chalk', style: 'css' }],
    ['import', { libraryName: 'ant-design-vue', libraryDirectory: 'es', style: 'css' }],
  ],
};
