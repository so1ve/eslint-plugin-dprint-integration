module.exports = {
  "extends": [
    "@so1ve",
    "plugin:dprint-integration/disable-conflict",
  ],
  "plugins": ["dprint-integration"],
  "rules": {
    "dprint-integration/dprint": "error",
  },
};
