const express = require('express');
const _ = require('lodash');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Sample data
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the test API' });
});

// Fixed: Added proper error handling for non-existent users
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Handle invalid ID parameter
  if (isNaN(userId)) {
    return res.status(400).json({ 
      error: 'Invalid user ID. Please provide a valid number.' 
    });
  }
  
  const user = users.find(u => u.id === userId);
  
  // Check if user exists before accessing properties
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found' 
    });
  }
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    nameLength: user.name.length
  });
});

// BUG 2: No input validation
app.post('/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email
  };
  
  // BUG: No validation - will create users with undefined values
  users.push(newUser);
  res.status(201).json(newUser);
});

// BUG 3: Inefficient array operation and potential memory leak
app.get('/users', (req, res) => {
  const limit = req.query.limit || 10;
  
  // BUG: This creates a new array every time and doesn't handle non-numeric limits
  const result = [];
  for (let i = 0; i < limit; i++) {
    if (users[i]) {
      result.push(users[i]);
    }
  }
  
  res.json(result);
});

// BUG 4: Synchronous operation that could block the event loop
app.get('/heavy-operation', (req, res) => {
  // BUG: This will block the event loop
  let result = 0;
  for (let i = 0; i < 1000000000; i++) {
    result += i;
  }
  
  res.json({ result });
});

// BUG 5: Missing error handling middleware
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// No global error handler - unhandled errors will crash the app 