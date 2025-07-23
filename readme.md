# PlanTogether

A web application for planning group events and meetings, taking into account each participant's availability.

## Features
- Create, edit, and delete events
- Join events via link/code
- Manage participants (remove, leave event)
- Set and save availability for each day of the week
- Algorithm to determine the optimal meeting time
- User authentication (registration, login, JWT)

## Tech Stack
- **Frontend:** React (react-router-dom, axios)
- **Backend:** Express.js, MongoDB (mongoose)
- **Authentication:** JWT, bcrypt

## Directory Structure
```
PlanTogether/
├── client/         # React frontend
│   └── src/pages/  # Main app pages (Dashboard, EventPage, Profile, etc.)
├── server/         # Express backend
│   ├── models/     # Data models (User, Event)
│   ├── routes/     # API endpoints
│   ├── controllers/# Business logic
│   └── app.js      # Main server file
```

## Data Models
### User
- `name` (String)
- `surname` (String)
- `email` (String, unique)
- `password` (String, hash)

### Event
- `title` (String)
- `description` (String)
- `creator` (ObjectId → User)
- `participants` (Array of { user: ObjectId → User, availability: Array })

## Main API Endpoints
### Users
- `POST   /api/users/register`  – register
- `POST   /api/users/login`     – login
- `GET    /api/users/me`        – get logged-in user data
- `PUT    /api/users/update`    – update profile

### Events
- `GET    /api/events`              – user's events list
- `POST   /api/events`              – create event
- `GET    /api/events/:id`          – event details
- `PUT    /api/events/:id`          – edit event
- `DELETE /api/events/:id`          – delete event
- `POST   /api/events/:id/join`     – join event
- `POST   /api/events/:id/leave`    – leave event
- `POST   /api/events/:id/kick`     – remove participant
- `POST   /api/events/:id/availability` – save availability

## Getting Started
1. **Requirements:**
   - Node.js >= 16.x (with npm)
   - MongoDB >= 4.x (local or cloud, e.g. MongoDB Atlas)
   - Git (to clone the repository)
   - `.env` config file in the `server/` directory (see below)

2. **Configuration:**
   - Create a `.env` file in the `server/` directory with the following content:
     ```env
     MONGO_URI=mongodb://localhost:27017/plantogether
     PORT=5000
     JWT_SECRET=your_super_secret_key
     ```

3. **Installation & Start:**
   ```bash
   # Frontend
   cd client
   npm install
   npm start

   # Backend (in a new terminal)
   cd ../server
   npm install
   node app.js
   ```

4. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Main App Pages
- **Dashboard** – your events list
- **EventPage** – event details, manage participants, availability
- **CreateEvent** – create new event
- **Profile** – edit your profile
- **Login/Register** – authentication

## Author
Project created as part of a recruitment task.
