
# NexaPrime — Store Rating Platform

NexaPrime is a full-stack web application that allows users to discover stores, view ratings, and share their experiences. Store owners can monitor their store's average rating and view the users who have rated their store.

## Live Links

- **Live Application:** https://nexaprime-store-rating.vercel.app
- **Backend API:** https://nexaprime-store-rating-api.onrender.com
- **GitHub Repository:** https://github.com/Diksha829-ai/nexaprime-store-rating

## Features

### Normal User
- Register and log in securely.
- Browse registered stores.
- Search stores by name and address.
- View store names, addresses, average ratings, and total ratings.
- Submit ratings from 1 to 5.
- Update previously submitted ratings.
- View personal ratings for each store.

### Store Owner
- Log in using an authorized owner account.
- View the owner's store name and average rating.
- View users who rated the store and their submitted ratings.

### Security and Validation
- Password hashing using bcrypt.
- JWT-based authentication.
- Backend role-based authorization.
- Input validation for registration and ratings.
- One rating per user per store, with updates supported.
- Environment variables for database credentials and authentication secrets.
- Protected API endpoints for authorized operations.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| Deployment | Vercel, Render |
| Version Control | Git, GitHub |

## Project Structure

```text
nexaprime-store-rating/
├── client/       # React frontend
├── server/       # Express backend
└── .gitignore
```

## Getting Started

### Prerequisites

Install the following before running the project locally:

- Node.js and npm
- Git
- A MongoDB Atlas account or another accessible MongoDB instance

### 1. Clone the Repository

```bash
git clone https://github.com/Diksha829-ai/nexaprime-store-rating.git
cd nexaprime-store-rating
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Replace the example values with your own configuration. Keep this file private and never commit it to GitHub.

Start the backend server:

```bash
npm start
```

The backend will normally run at:

http://localhost:5000

### 3. Set Up the Frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL shown in your terminal, normally:

http://localhost:5173

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `PORT` | Backend | Port used by the Express server |
| `MONGO_URI` | Backend | MongoDB connection string |
| `JWT_SECRET` | Backend | Secret used to sign authentication tokens |
| `CLIENT_URL` | Backend | Frontend origin allowed by CORS |
| `VITE_API_URL` | Frontend | Base URL of the backend API |

Configure production values in the Render and Vercel dashboards. Never expose actual database credentials, JWT secrets, or other private configuration values.

## API Overview

The backend provides APIs for:

- User registration and authentication
- Store listing and searching
- Submitting and updating store ratings
- Retrieving store-owner dashboard information

**Backend URL:** https://nexaprime-store-rating-api.onrender.com

Protected endpoints require valid authentication and appropriate authorization.

## Test Account Credentials

The following dedicated test accounts are intended for evaluator use. Publish these credentials only after confirming that both accounts work on the live application and that they contain no personal or production credentials.

| Role | Email | Password |
|---|---|---|
| Normal User | `user1@gmail.com` | `User1@123` |
| Store Owner | `owner@gmail.com` | `Owner@123` |

### Testing Instructions

1. Open the [live application](https://nexaprime-store-rating.vercel.app).
2. Sign in with the normal-user account to test store search, rating submission, and rating updates.
3. Sign in with the store-owner account to verify the store's average rating and the list of users who rated it.
4. Verify that users cannot access unauthorized owner-only features.

**Important:** These credentials will be publicly visible in this repository. Use dedicated test accounts with no access to personal information or sensitive production data. If either account does not work, provision or verify it before publishing the README.

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

Production environment variables must be configured securely in the respective hosting dashboards.

## Security Notes

- Never commit `.env` files or secrets to version control.
- Use dedicated test accounts for evaluation.
- Keep database credentials and JWT signing secrets private.
- Use backend authorization to restrict access to protected resources.

## License

Developed as part of the NexaPrime Full Stack Intern Coding Challenge.
