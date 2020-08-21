var webpack = require("webpack"),
	path = require("path"),
	externals = require('webpack-node-externals'),
	{default: DtsBundlePlugin} = require('webpack-dts-bundle');

module.exports = {
	mode: 'development',	//This is meant to be bundled afterward anyway
	context: path.resolve(__dirname, 'src'),
	entry: {
		'resil-schema': ['./index.ts'],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, "dist"),/*
		libraryTarget: 'umd',
		library: 'resil-schema',*/
		umdNamedDefine: true
	},
	plugins: [
		/*new DtsBundlePlugin({
			name: 'terramap',
			main: 'dist/index.d.ts',
			out: 'terramap.d.ts',
			removeSource: true
		})*/
	],
	externals: [
		externals()
	],
	devtool: 'source-map',
	module: {
		rules: [{
			test: /\.tsx?$/,
			exclude: /node_modules/,
			loader: 'ts-loader',
			options: {
				appendTsSuffixTo: [/\.vue$/]
			}
		}, {
			enforce: 'pre',
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: "source-map-loader"
		}]
	},
	resolve: {
		extensions: [".ts"]
	}
};