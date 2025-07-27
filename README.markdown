AR Platform
A platform mimicking Artivive.com for artists to upload artwork and AR content, link them, and generate a WebAR experience.
Setup Instructions

Prerequisites:

Node.js (v16 or higher)
npm


Backend Setup:

Navigate to the backend directory:cd backend


Install dependencies:npm install


Start the backend server:npm start


The backend will run on http://localhost:3001.


Frontend Setup:

Navigate to the frontend directory:cd frontend


Install dependencies:npm install


Start the frontend server:npm start


The frontend will run on http://localhost:3002.


Initial Setup:

A test user is pre-created (username: "test", password: "test"). Log in at http://localhost:3002/login.
Create an empty uploads folder in the backend directory.


Usage:

Log in to access the dashboard.
Upload an artwork image (JPG/PNG) and AR content (MP4).
Click "Publish AR Experience" to generate a shareable WebAR URL.
View the AR experience on a mobile device by opening the URL and pointing the camera at the artwork.


Notes:

Ensure both servers are running.
The WebAR experience uses A-Frame and AR.js.
Data is stored in SQLite databases (database.db and sessions.db).


