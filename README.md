# eslint-plugin-dprint-integration

[![NPM version](https://img.shields.io/npm/v/eslint-plugin-dprint-integration?color=a1b858&label=)](https://www.npmjs.com/package/eslint-plugin-dprint-integration)

Make dprint work with eslint.

## 📦 Installation

```bash
$ npm install eslint-plugin-dprint-integration -D
$ yarn add eslint-plugin-dprint-integration -D
$ pnpm add eslint-plugin-dprint-integration -D
```

## 🚀 Usage

### Basic

Add these line to your eslintrc:

```ts
// .eslintrc.js
module.exports = {
  plugins: ["dprint-integration"],
  rules: {
    "dprint-integration/dprint": "error",
  },
};
```

This will use dprint's default config.

### Advanced

You can pass config to the plugin:

```ts
// .eslintrc.js
module.exports = {
  plugins: ["dprint-integration"],
  rules: {
    "dprint-integration/dprint": [
      "error",
      // Global Config (will pass to the dprint formatter directly): Available at https://dprint.dev/config/
      {
        lineWidth: 80,
      },
      // Plugin Specific Config (will pass to the dprint plugins): Available at https://dprint.dev/plugins/
      {
        typescript: {
          // This applies to both JavaScript & TypeScript
          "quoteStyle": "preferSingle",
          "binaryExpression.operatorPosition": "sameLine",
        },
        json: {},
        toml: {},
        markdown: {},
        dockerfile: {},
      },
    ],
  },
};
```
```

## 📝 License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve)
