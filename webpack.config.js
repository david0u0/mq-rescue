const path = require('path');

module.exports = {
	target: 'electron-renderer',
	entry: {
		index: './src/app.tsx'
	},
	resolve: {
		mainFields: ['browser', 'main', 'module'],
		extensions: ['.ts', '.tsx', '.js'],
	},
	output: {
		path: path.resolve(__dirname, 'dist/src'),
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/typescript',
							],
						}
					},
				]
			},
			{
				test: /\.tsx$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/typescript',
								'@babel/preset-react'
							],
						}
					},
				]
			}
		]
	},
	mode: 'development'
};
