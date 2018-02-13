const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');


const TRANSCRIPTS_TABLE = process.env.TRANSCRIPTS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send('Hello World!')
})

// Get User endpoint
app.get('/transcript/:transcriptId', function (req, res) {
  const params = {
    TableName: TRANSCRIPTS_TABLE,
    Key: {
      transcriptId: req.params.transcriptId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get transcript' });
    }
    if (result.Item) {
      const {transcriptId, title, description} = result.Item;
      res.json({ transcriptId, title, description });
    } else {
      res.status(404).json({ error: "transcript not found" });
    }
  });
})

// Create User endpoint
app.post('/transcripts', function (req, res) {
  const { transcriptId, title, description } = req.body;
  if (typeof transcriptId !== 'string') {
    res.status(400).json({ error: '"transcriptId" must be a string' });
  } else if (typeof title !== 'string') {
    res.status(400).json({ error: '"title" must be a string' });
  } else if (typeof description !== 'string') {
    res.status(400).json({ error: '"description" must be a string' });
  }

  const params = {
    TableName: TRANSCRIPTS_TABLE,
    Item: {
      transcriptId: transcriptId,
      title: title,
      description: description,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create transcript' });
    }
    res.json({ transcriptId, title, description});
  });
})

module.exports.handler = serverless(app);
