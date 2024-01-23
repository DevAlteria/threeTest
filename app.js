const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const fs = require("fs");
const config = require("./webpack.config.js");
const compiler = webpack(config);


const express = require('express');
const app = express();
const port = 3000;


app.use(
    webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
    })
    );
    
app.use("/assets", express.static("assets"));
    
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    });