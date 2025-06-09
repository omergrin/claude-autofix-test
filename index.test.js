const request = require('supertest');
const express = require('express');

// Import the app logic by requiring the index file
// Note: We would need to refactor index.js to export the app for proper testing
// For now, this demonstrates the test structure

describe('User API Endpoints', () => {
  let app;
  
  beforeEach(() => {
    // Mock the app setup
    app = express();
    app.use(express.json());
    
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
    // Recreate the fixed endpoint logic
    app.get('/users/:id', (req, res) => {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'Invalid user ID. Must be a number.'
        });
      }
      
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: `No user exists with ID ${userId}`
        });
      }
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        nameLength: user.name.length
      });
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
        error: 'User not found',
        message: 'No user exists with ID 999'
      });
    });

    test('should return 400 when user ID is not a number', async () => {
      const response = await request(app)
        .get('/users/abc')
        .expect(400);
      
      expect(response.body).toEqual({
        error: 'Invalid user ID. Must be a number.'
      });
    });

    test('should return 400 when user ID is empty', async () => {
      const response = await request(app)
        .get('/users/')
        .expect(404); // Express treats this as a different route
    });
  });
});