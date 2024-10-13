const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // Allow cross-origin requests from frontend
app.use(bodyParser.json({ limit: '100mb' }));
// API route to save events to a file
app.post('/save-events', (req, res) => {
  const events = req.body;

  if (!events || events.length === 0) {
    return res.status(400).send('No events to save');
  }

  // Save events to a file (events.json)
  fs.writeFile('events.json', JSON.stringify(events, null, 2), (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).send('Failed to save events');
    }
    res.send('Events saved successfully');
  });
});

app.get('/get-events', (req, res) => {
    fs.readFile('events.json', 'utf-8', (err, data) => {
        if (err) { 
          res.send("error reading events.json");
          return;
        }
        const events = JSON.parse(data);
        res.json(events);
    });

});

const PORT = 2000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
