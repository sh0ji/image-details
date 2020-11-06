module.exports = {
	extends: [
		'airbnb-base',
	],
	rules: {
		indent: ['error', 'tab'],
		'no-tabs': 0,
		// https://basarat.gitbook.io/typescript/main-1/defaultisbad
		'import/prefer-default-export': 'off',
		'import/no-default-export': 'error',
		'lines-between-class-members': [
			'error',
			'always',
			{
				exceptAfterSingleLine: true,
			},
		],
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
	},
	env: {
		browser: true,
	},
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			extends: [
				'plugin:import/typescript',
				'plugin:@typescript-eslint/recommended',
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
			],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: [
					'./src/tsconfig.json',
					'./site/tsconfig.json',
				],
			},
			rules: {
				indent: 'off',
				'no-tabs': 'off',
				'@typescript-eslint/indent': ['error', 'tab'],
				'@typescript-eslint/no-empty-interface': 'off',
			},
		},
	],
};
