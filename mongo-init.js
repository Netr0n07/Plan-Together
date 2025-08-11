// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the plantogather database
db = db.getSiblingDB('plantogather');

// Create a user for the application
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'plantogather'
    }
  ]
});

// Create collections with some basic indexes
db.createCollection('users');
db.createCollection('events');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.events.createIndex({ "creator": 1 });
db.events.createIndex({ "participants.user": 1 });

print('MongoDB initialized successfully!');
