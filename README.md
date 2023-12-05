# eslint-plugin-dprint-integration

[![NPM version](https://img.shields.io/npm/v/eslint-plugin-dprint-integration?color=a1b858&label=)](https://www.npmjs.com/package/eslint-plugin-dprint-integration)

Make dprint work with eslint. Works perfectly with virtual files (like codeblocks in markdown).

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

Or:

```ts
// .eslintrc.js
module.exports = {
  extends: ["plugin:dprint-integration/recommended"],
};
```

To turn off the conflicting stylish eslint rules (like eslint-config-prettier), just add:

```ts
// .eslintrc.js
module.exports = {
  extends: ["plugin:dprint-integration/disable-conflict"],
};
```

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
        malva: {},
        markup: {},
      },
    ],
  },
};
```

If you want, you can use `dprint.json`:

```ts
// .eslintrc.js
module.exports = {
  plugins: ["dprint-integration"],
  rules: {
    "dprint-integration/dprint": [
      "error",
      // Global Config (will pass to the dprint formatter directly): Available at https://dprint.dev/config/
      {
        // A special option to use dprint.json
        useDprintJson: true,
        // Or a specified path to dprint.json
        // useDprintJson: "path/to/dprint.json",
      },
      // Plugin Specific Config (will pass to the dprint plugins): Available at https://dprint.dev/plugins/
      {},
    ],
  },
};
```

## 📝 License

[MIT](./LICENSE). Made with ❤️ by [Ray](https://github.com/so1ve)
