//Install express server
const express = require('express');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const Pool = require('pg').Pool;
const rp = require('request-promise');

const app = express();

const BASE_PRICE_URL = 'https://api.coindesk.com/v1/bpi/currentprice.json';

// DB connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Library...
const uuid = () => {
  const S4 = () => {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
  }
 
  // then to call it, plus stitch in '4' in the third group
  const guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
  return guid
}

const handleError = (response, error, code) => {
  console.error('Error: ' + error)
  return response.status(code || 500).json({message: code === 500 ? 'Something went wrong' : error})
}

// Middleware
app.use(compression());
app.use(bodyParser.json());

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist'));


// Routes


// API

// Ping
app.get('/api/ping', function (req, res) {
  res.status(200).json({pong: (new Date()).toISOString()})
})

app.get('/api/prices', function (req, res) {
  const options = {
    uri: BASE_PRICE_URL,
    json: true
  };

  console.info('Calling ' + BASE_PRICE_URL);
  rp(options)
    .then(function (data) {
      // Proxy the data straight through (for now at least)
      res.status(200).json(data);
    })
    .catch(function (err) {
      // Log the full error, output "server error" message
      console.error(err);
      res.status(500).json({message: 'Server error'});
    });
});

// MUST GO LAST:

// If we don't have a route above, fall back to the Angular app
app.get('/*', function(req, res) {  
  res.sendFile(path.join(__dirname+'/dist/btc-tracker/index.html'));
});

// Start the app by listening on the default Heroku port
const server = app.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log('Listening on port ' + port);
  if (typeof process.env.DATABASE_URL !== 'string') {
    console.error('Invalid or missing environment variable DATABASE_URL!');
    process.exit(1);
  }
});
