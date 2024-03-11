const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const axios = require('axios');

const app = express();
const port = 3000;

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test_db'
});

// Vulnerability: SQL Injection
function getUserData(username, callback) {
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  connection.query(query, (error, results) => {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

// Vulnerability: SSRF
function fetchInternalData(url, callback) {
  axios.get(url)
    .then(response => {
      callback(null, response.data);
    })
    .catch(error => {
      callback(error, null);
    });
}

app.use(bodyParser.urlencoded({ extended: false }));

// Handle GET requests to fetch user data
app.get('/user/:username', (req, res) => {
  const username = req.params.username;
  getUserData(username, (error, data) => {
    if (error) {
      res.status(500).send('Error fetching user data');
    } else {
      res.json(data);
    }
  });
});

// Handle POST requests to fetch internal data
app.post('/internal-data', (req, res) => {
  const { url } = req.body;
  fetchInternalData(url, (error, data) => {
    if (error) {
      res.status(500).send('Error fetching internal data');
    } else {
      res.send(data);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
