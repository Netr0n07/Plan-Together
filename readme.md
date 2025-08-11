# PlanTogether

Bring people together faster: create an event, share a link, collect everyone’s availability, and get the best common time without endless chats.

## Storyline

In a world where everyone’s calendar is packed, PlanTogather is your airship. You set up the deck (event), invite the crew (participants) with a link, and each person marks when they can sail (availability). The app crunches everyone’s inputs and shows the best time window so you can simply meet.

## Screenshots

- Dashboard  
<img width="1919" height="918" alt="obraz" src="https://github.com/user-attachments/assets/80b4b738-9541-4fd4-841c-7000e05c44fd" />

- Create Event  
<img width="1919" height="916" alt="obraz" src="https://github.com/user-attachments/assets/736f2f67-ac7d-4602-9fc9-955db1ee53ef" />

- Event Details + Invite Link  
<img width="1919" height="918" alt="obraz" src="https://github.com/user-attachments/assets/577e88d9-7adf-4d50-9445-0970b8041396" />

- Inline Edit (title/description, creator-only)  
<img width="806" height="751" alt="obraz" src="https://github.com/user-attachments/assets/aeced233-ad40-4f77-81f2-cfb7d3290914" />

- Availability Input (per day: all free/busy or time range)  
<img width="549" height="903" alt="obraz" src="https://github.com/user-attachments/assets/411c629b-eba8-4e45-8dbe-ca936deac729" />

- Best Time for the Event (algorithm result)  
<img width="426" height="307" alt="obraz" src="https://github.com/user-attachments/assets/4f16aec2-976a-4b01-be85-2f71bf2a1f9b" />

- Edit Profile + Change Password + Logout (with confirmation)  
<img width="1919" height="919" alt="obraz" src="https://github.com/user-attachments/assets/721d0e36-bcc4-4f0e-91fd-b5571a7b3424" />

## Features

- User registration and authentication (JWT)
- Create and manage events
- Per-day availability: all free/busy or precise hours
- Inline title/description editing (creator only)
- Profile management and password change (requires current password)
- Logout with confirmation
- Multi-language support (English/Polish)
- Responsive dark theme

## Mechanics

- Participants and roles
  - Creator: inline edit title/description, delete event, remove participants
  - Participants: join with link, declare availability, leave event
- Invite link: auto-generated, one-click copy
- Best-time algorithm
  - If someone is “all day”, intersect remaining ranges
  - Otherwise, intersect declared ranges for all participants
  - No overlap → “No common time”

## Tech Stack

- **Frontend:** React (React Router, axios), i18n
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** JWT
- **Containerization:** Docker (multi‑stage) + docker‑compose

## Directory Structure

```text
PlanTogather/
├─ client/                          # React frontend
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/                    # Dashboard, EventDetails, CreateEvent, Profile, etc.
│  │  ├─ locales/                  # i18n (en/pl)
│  │  ├─ index.js
│  │  └─ App.js
│  ├─ package.json
│  └─ ...
├─ server/                          # Express backend
│  ├─ controllers/                  # Business logic (users, events)
│  ├─ routes/                       # API endpoints
│  ├─ models/                       # Mongoose models (User, Event)
│  ├─ middlewares/                  # Auth/JWT, etc.
│  ├─ app.js                        # Main server file
│  ├─ package.json
│  └─ ...
├─ Dockerfile                       # Multi-stage build
├─ docker-compose.yml.example       # Compose template (do not commit real compose)
├─ DOCKER_README.md                 # Docker usage guide
├─ LICENSE
└─ README.md
```

## Prerequisites

- Docker and Docker Compose installed
- MongoDB Atlas account (or local MongoDB)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd PlanTogather
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

3. **Run with Docker:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Open your browser and go to `http://localhost:5000`
   - Register a new account or log in with existing credentials

> Note: do not commit secrets. Keep your local `docker-compose.yml` untracked and use the provided `docker-compose.yml.example` as a template.

## Development Setup

### Frontend (React)
```bash
cd client
npm install
npm start
```

### Backend (Node.js)
```bash
cd server
npm install
node app.js
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 5000) | No |

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/join` - Join event
- `POST /api/events/:id/leave` - Leave event
- `POST /api/events/:id/availability` - Set availability

## Docker Commands

```bash
# Build and start
docker-compose up --build

# Start in background
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f app

# Rebuild without cache
docker-compose up --build --force-recreate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
