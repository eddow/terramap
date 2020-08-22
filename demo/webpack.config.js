var webpack = require("webpack"),
	path = require("path"),
	HtmlWebpackPlugin = require('html-webpack-plugin');
	
module.exports = {
	mode: 'development',
	devtool: 'eval',
	entry: {
		app: [path.resolve(__dirname, './index.ts'), 'webpack-dev-server-status-bar']
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, "dist"),
		chunkFilename: "[chunkhash].js"
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './index.ejs'),
			favicon: path.resolve(__dirname, './favicon.png'),
			title: 'terramap-demo'
		})
	],
	module: {
		rules: [{
			test: /\.tsx?$/,
			exclude: /node_modules/,
			loader: 'ts-loader'
		}, {
			test: /\.css$/,
			loader: "style-loader!css-loader"
		}, {
			enforce: 'pre',
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: "source-map-loader"
		}]
	},
	resolve: {
		alias: {
			'terramap': path.resolve(__dirname, '../src/')
		},
		extensions: [".ts", ".js", '.html']
	},
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		compress: true,
		port: 9001,
		overlay: true,
		historyApiFallback: true,
		stats: {
			colors: true
		}
	}
};