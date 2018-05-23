const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const path = require('path');
const app = express();
const port = process.env.PORT || 8000;
app.use(express.json());

mongoose.connect('mongodb://localhost/myTestApp');
let db = mongoose.connection;
db.on('error', () => console.log('mongodb error'));
db.once('open', () => console.log('mongodb connection successful'));

const userSchema = mongoose.Schema({
  name: String,
  description: String
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

app.get('/api/users', (req, res) => {
  User.find((err, users) => {
    if (err) return res.status(404).send('Resource not found');
    res.send(users);
  });
});

app.get('/api/users/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err) return res.status(404).send(`Resource not found`);
    res.send(user);
  });
});

app.put('/api/users/:id', (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  User.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, user) => {
    if (err) return res.status(500).send(`Internal server error`);
    res.send(user);
  })
});

app.post('/api/users', (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) return res.status(500).send('Internal Server Error');
    res.send(user);
  });
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function validateUser(user) {
  const schema = {
    name: Joi.string().min(1).required(),
    description: Joi.string().min(2).required()
  };
  return Joi.validate(user, schema);
}

app.listen(port, () => console.log(`running on port ${port}`));
