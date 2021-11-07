const express = require('express');
const app = express();
const router = require("./sqsService");
require("dotenv").config();

app.use(express.json());
app.use(router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('server running on port ' + PORT));