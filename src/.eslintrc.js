module.exports = {
	env: {
		browser: true,
	},
	extends: [
		'airbnb-base',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'@typescript-eslint/indent': ['error', 'tab'],
		'@typescript-eslint/no-empty-interface': 'off',
		indent: 'off',
		'lines-between-class-members': [
			'error',
			'always',
			{
				exceptAfterSingleLine: true,
			},
		],
		'no-tabs': 'off',
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				mjs: 'never',
				jsx: 'never',
				ts: 'never',
				tsx: 'never',
			},
		],
	}
};
