const express = require('express');

const port = 5000;
const app = express();

app.get('/oauth2callback', (req, res) => {
    console.log(req.query);
    console.log(req.body);

    res.send('Foi');
});

app.listen(port);
