const { so1ve } = require("@so1ve/eslint-config");

module.exports = so1ve(
	{},
	{
		ignores: ["test/__fixtures__/**"],
	},
);
