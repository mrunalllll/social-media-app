Mini Social Media Platform

A small social media web app where users can create profiles, share posts, comment, like, and follow each other. Built as a college project (Task 2: Social Media Platform).

Features
User registration and login
Profile page with bio and follower/following counts
Create, view, and delete posts
Comment on posts
Like and unlike posts
Follow and unfollow other users
Feed showing posts from people you follow
Responsive layout that works on desktop and mobile
Tech Stack
Layer	Technology
Frontend	HTML, CSS, JavaScript
Backend	Node.js with Express.js
Database	SQLite (via better-sqlite3)
Prerequisites
Node.js (v18 or newer; LTS recommended)
npm (comes with Node.js)
Getting Started
Open the project folder
   cd path\to\project
Install dependencies
   npm install
Start the server
   npm start

For development with auto-restart on file changes:

   npm run dev
Open the app in your browser at http://localhost:3000 (or the port printed in the terminal).

The SQLite database file is created automatically the first time the server runs.

Scripts
Command	What it does
npm start	Runs the server with Node
npm run dev	Runs the server with nodemon (auto-restart)

If npm run dev is missing, add this to package.json and run npm install --save-dev nodemon:

json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
Database Overview
Table	Purpose
users	Account details, username, password hash, bio
posts	Posts written by users
comments	Comments attached to posts
likes	Which user liked which post
followers	Which user follows which user
Project Structure
project/
├── server.js        # Express server and API routes
├── database.js      # SQLite setup and table creation
├── package.json
├── public/
│   ├── index.html
│   ├── css/         # Stylesheets
│   └── js/          # Frontend scripts
└── README.md

Adjust this to match your actual folder layout.

Troubleshooting

npm error Missing script: "dev" Add the dev script shown above, or use npm start.

better-sqlite3 fails to install (node-gyp errors) Your Node version may be too new for the installed release. Run:

npm install better-sqlite3@latest

Or switch to Node 22 LTS and reinstall with npm install.

Port already in use Close the other process using the port, or change the port in server.js.

Future Improvements
Profile pictures and image uploads
Notifications
Search for users and posts
Direct messages
Author

Mrunal Sandip University, Nashik
