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

2. **Database Setup (MongoDB Atlas):**
   
   **Option A: MongoDB Atlas (Recommended for production)**
   
   a) Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
   
   b) Create a new project and cluster:
      - Click "Build a Database"
      - Choose "FREE" tier (M0)
      - Select your preferred cloud provider and region
      - Click "Create"
   
   c) Set up database access:
      - Go to "Database Access" in the left sidebar
      - Click "Add New Database User"
      - Create a username and password (save these!)
      - Select "Read and write to any database"
      - Click "Add User"
   
   d) Set up network access:
      - Go to "Network Access" in the left sidebar
      - Click "Add IP Address"
      - Click "Allow Access from Anywhere" (or add your specific IP)
      - Click "Confirm"
   
   e) Get your connection string:
      - Go back to "Database" → "Connect"
      - Choose "Connect your application"
      - Select "Node.js" and version "6.7 or later"
      - Copy the connection string
      - Replace `<password>` with your database user password
      - Replace `<dbname>` with `plantogether` (or your preferred database name)
   
   **Option B: Local MongoDB**
   
   - Install MongoDB locally and use: `mongodb://localhost:27017/plantogether`

3. **Configuration:**
   - Create a `.env` file in the `server/` directory with the following content:
     ```env
     MONGO_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/plantogether?retryWrites=true&w=majority
     PORT=5000
     JWT_SECRET=your_super_secret_key_here
     ```
   
   **Important:** Replace the placeholders with your actual values:
   - `your_username`: Your MongoDB Atlas database username
   - `your_password`: Your MongoDB Atlas database password
   - `cluster0.xxxxx.mongodb.net`: Your actual cluster URL from MongoDB Atlas
   - `your_super_secret_key_here`: A strong random string for JWT token signing

4. **Installation & Start:**
   ```bash
   # Frontend
   cd client
   npm install
   npm start

   # Backend (in a new terminal)
   cd server
   npm install
   node app.js
   ```

5. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Main App Pages
- **Dashboard** – your events list
- **EventPage** – event details, manage participants, availability
- **CreateEvent** – create new event
- **Profile** – edit your profile
- **Login/Register** – authentication