const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/view.js",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./public",
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Wedge 3D Boey",
    }),
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/3dview/",
  },
};
