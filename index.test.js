const request = require('supertest');
const express = require('express');

// Create a test version of the app
const app = express();
app.use(express.json());

// Sample data (same as in index.js)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// Copy the fixed endpoint implementation
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Validate ID parameter
  if (isNaN(userId)) {
    return res.status(400).json({
      error: 'Invalid user ID. ID must be a number.'
    });
  }
  
  const user = users.find(u => u.id === userId);
  
  // Check if user exists before accessing properties
  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }
  
  // Safe to access user properties now
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    nameLength: user.name.length
  });
});

describe('GET /users/:id endpoint', () => {
  
  test('should return user data for valid existing user ID', async () => {
    const response = await request(app).get('/users/1');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      nameLength: 8
    });
  });

  test('should return 404 for non-existent user ID', async () => {
    const response = await request(app).get('/users/999');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'User not found'
    });
  });

  test('should return 400 for invalid user ID (non-numeric)', async () => {
    const response = await request(app).get('/users/abc');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid user ID. ID must be a number.'
    });
  });

  test('should return 400 for invalid user ID (special characters)', async () => {
    const response = await request(app).get('/users/@#$');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid user ID. ID must be a number.'
    });
  });

  test('should return user data for second existing user', async () => {
    const response = await request(app).get('/users/2');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      nameLength: 10
    });
  });

  test('should return 404 for user ID 0', async () => {
    const response = await request(app).get('/users/0');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'User not found'
    });
  });
});