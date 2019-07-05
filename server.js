//Install express server
const express = require('express');
const expressSanitized = require('express-sanitized');
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

// Middleware
app.use(compression());
app.use(bodyParser.json());
app.use(expressSanitized());

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist'));


// Routes


// API

// Ping
app.get('/api/ping', (req, res) => {
  res.status(200).send({pong: (new Date()).toISOString()})
})

// Prices pass-through (just to check everything is working)
app.get('/api/prices', (req, res) => {
  const options = {
    uri: BASE_PRICE_URL,
    json: true
  };

  console.info('Calling ' + BASE_PRICE_URL);
  rp(options)
    .then(function (data) {
      // Proxy the data straight through (for now at least)
      res.status(200).send(data);
    })
    .catch(function (err) {
      // Log the full error, output "server error" message
      console.error(err);
      res.status(500).send({message: 'Server error'});
    });
});

// Events CRUD

app.post('/api/events', (req, res) => {
  let propertiesValidated = '';
  try {
    propertiesValidated = JSON.stringify(JSON.parse(req.body.properties));
  } catch (exc) {
    return res.status(400).send({message: 'Error: invalid parameter properties, expected valid JSON'});
  }
  let newItem = {
    name: req.body.name,
    desc: req.body.desc,
    eventType: req.body.eventType,
    properties: propertiesValidated
  };
  return pool.query(
    'INSERT INTO "events"("name", "desc", "eventType", "properties") VALUES($1, $2, $3, $4) ' +
    ' RETURNING "id", "createdAt"',
    [newItem.name, newItem.desc, newItem.eventType, newItem.properties],
    (error, results) => {
      if (error || results.rowCount === 0) {
        console.log('Error: failed to create item "' + newItem.name + '"');
        console.log('Error message: ' + error);

        if (error.detail === "Key (name)=(" + newItem.name + ") already exists.") {
          return res.status(409).send({message: 'Field name must be unique'});
        }

        return res.status(400).send({
          message: 'Error: failed to create item ' + newItem.name 
            + ': ' + error || 'Unknown error'
        });
      }

      newItem = Object.assign(newItem, results.rows[0]);
      return res.status(201).send(newItem);
    }
  );
});

app.get('/api/events/:id', (req, res) => {
  const id = req.params.id;
  if (typeof id === 'undefined') {
    return res.status(404).send({message: 'No item found'});
  }

  return pool.query(
    'SELECT "id", "name", "desc", "eventType", "createdAt", "properties" FROM "events" WHERE "id" = $1 LIMIT 1',
    [id],
    (error, results) => {
      if (error) {
        console.log('Error message: ' + error);
        return res.status(400).send({message: 'Error: failed finding item : ' + error})
      }

      if (results.rowCount === 0) {
        console.log('Error: No item found with ID ' + id);
        return res.status(404).send({message: 'No item found with ID ' + id});
      }

      return res.status(200).send(results.rows.pop());
    }
  );
});

app.put('/api/events/:id', (req, res) => {
  const id = req.params.id;
  if (typeof id === 'undefined') {
    return res.status(404).send({message: 'No item found'});
  }

  let propertiesValidated = '';
  try {
    propertiesValidated = JSON.stringify(JSON.parse(req.body.properties));
  } catch (exc) {
    return res.status(400).send({message: 'Error: invalid parameter properties, expected valid JSON'});
  }

  return pool.query(
    'SELECT "id", "name", "desc", "eventType", "createdAt", "properties" FROM "events" WHERE "id" = $1 LIMIT 1',
    [id],
    (error, results) => {
      if (error) {
        console.log('Error message: ' + error);
        return res.status(400).send({message: 'Error: failed finding item : ' + error})
      }
      
      if (results.rowCount === 0) {
        console.log('Error: No item found with ID ' + id);
        return res.status(404).send({message: 'No item found with ID ' + id});
      }

      const currentItem = results.rows[0];

      let newItem = {
        name: req.body.name,
        desc: req.body.desc,
        eventType: req.body.eventType,
        properties: propertiesValidated
      };
      return pool.query(
        'UPDATE "events" SET "name" = $1, "desc" = $2, "eventType" = $3, "properties" = $4' +
        ' WHERE "id" = $5', 
        [newItem.name, newItem.desc, newItem.eventType, newItem.properties, id],
        (error, results) => {
          if (error) {
            console.log('Error message: ' + error);
            return res.status(400).send({message: 'Error: failed updating item : ' + error})
          }
          
          if (results.rowCount === 0) {
            console.log('Error: failed updating item ' + id);
            return res.status(400).send({message: 'Error: failed updating item ' + id});
          }
          newItem = Object.assign(currentItem, newItem);
          return res.status(200).send(newItem);
      });
  });
});

app.delete('/api/events/:id', (req, res) => {
  const id = req.params.id;
  if (typeof id === 'undefined') {
    return res.status(404).send({message: 'No item found'});
  }

  return pool.query(
    'DELETE FROM "events" WHERE "id" = $1', 
    [id],
    (error, results) => {
      if (error) {
        console.log('Error: failed deleting item: ' + error);
        return res.status(400).send({message: 'Item not found with ID ' + id})
      }
      
      if (results.rowCount === 0) {
        console.log('Error: no rows deleted when trying to delete item ' + id);
        return res.status(404).send({message: 'Item not found with ID ' + id});
      }

      return res.status(204).send();
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
