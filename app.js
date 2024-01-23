const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
    });

app.get('/view', (req, res) => {
            res.sendFile(path.join(__dirname, '/view.html'));
    });
    

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    });