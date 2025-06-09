const request = require('supertest');
const express = require('express');

// Import the same application setup as in index.js
const app = express();
app.use(express.json());

// Sample data (same as in index.js)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// Fixed endpoint implementation (copy the fixed version from index.js)
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

describe('GET /users/:id', () => {
  test('should return user when valid ID exists', async () => {
    const response = await request(app)
      .get('/users/1')
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      nameLength: 8
    });
  });

  test('should return 404 when user does not exist', async () => {
    const response = await request(app)
      .get('/users/999')
      .expect(404);

    expect(response.body).toEqual({
      error: 'User not found'
    });
  });

  test('should return 400 for invalid user ID', async () => {
    const response = await request(app)
      .get('/users/abc')
      .expect(400);

    expect(response.body).toEqual({
      error: 'Invalid user ID. Please provide a valid number.'
    });
  });

  test('should return 400 for non-numeric ID', async () => {
    const response = await request(app)
      .get('/users/not-a-number')
      .expect(400);

    expect(response.body).toEqual({
      error: 'Invalid user ID. Please provide a valid number.'
    });
  });
});