# 🌐 Mini Social Media Platform

### A Full-Stack Social Networking Web Application


  🚀 Connect • Share • Like • Comment • Follow


---

## 📌 About The Project

**Mini Social Media Platform** is a full-stack web application developed as part of my college project (Task 2: Social Media Platform).

The application provides a simple social networking experience where users can register, log in, create profiles, share posts, like and comment on posts, and follow other users.

The main objective of this project is to gain practical experience in full-stack web development, backend development, database management, and user authentication.

## ✨ Features

- 🔐 **User Authentication** – Register and log in securely.
- 👤 **User Profiles** – Create profiles with usernames and bios.
- 📝 **Create Posts** – Share thoughts and updates.
- 🗑️ **Delete Posts** – Delete your own posts.
- ❤️ **Like & Unlike** – Interact with other users' posts.
- 💬 **Comments** – Comment on posts and interact with others.
- 🤝 **Follow & Unfollow** – Connect with other users.
- 📰 **Personalized Feed** – View posts from people you follow.
- 📊 **Follower Statistics** – Display followers and following counts.
- 📱 **Responsive Design** – Works on desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime environment |
| Express.js | Backend framework |
| SQLite | Database management |
| better-sqlite3 | SQLite database connectivity |

## 📂 Project Structure

```text
Mini-Social-Media-Platform/
│
├── server.js
├── database.js
├── package.json
├── package-lock.json
│
├── public/
│   ├── index.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── script.js
│
├── README.md
└── .gitignore
```

*Note: Update the structure according to your actual project files.*

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) (Version 18 or newer)
- npm (Node Package Manager)
- Visual Studio Code (Recommended)

### 2. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/mini-social-media-platform.git
```

### 3. Navigate to the Project Folder

```bash
cd mini-social-media-platform
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start the Application

```bash
npm start
```

For development mode:

```bash
npm run dev
```

### 6. Open in Browser

```text
http://localhost:3000
```

🎉 Your Mini Social Media Platform is now running!

## 📦 Dependencies

Main dependencies used in this project:

- Express.js
- better-sqlite3
- Nodemon (Development)

Install the required packages:

```bash
npm install express better-sqlite3
```

For development:

```bash
npm install --save-dev nodemon
```

## 🗄️ Database Design

The application uses SQLite for storing user information and social interactions.

| Table | Description |
|---|---|
| users | Stores user account and profile information |
| posts | Stores posts created by users |
| comments | Stores comments on posts |
| likes | Stores likes given to posts |
| followers | Stores user follow relationships |

### Database Relationships

- One user can create multiple posts.
- One post can have multiple comments.
- One post can receive multiple likes.
- One user can follow multiple users.
- One user can have multiple followers.

The database is initialized automatically when the server starts, according to the database setup.

## 📸 Screenshots

Screenshots of the application will be added here.

| Home Feed | User Profile |
|---|---|
| Add your home page screenshot here | Add your profile screenshot here |

| Login Page | Create Post |
|---|---|
| Add your login screenshot here | Add your post screenshot here |

## 🚀 Future Enhancements

The following features can be added in future versions:

- 🖼️ Profile picture uploads.
- 🔔 Real-time notifications.
- 🔍 Search users and posts.
- 💌 Direct messaging.
- 🎥 Image and video sharing.
- 🌙 Dark and light themes.
- ✏️ Edit existing posts.
- 🔒 Advanced account security.

## 🎯 Learning Outcomes

Through this project, I gained practical knowledge of:

- Frontend development using HTML, CSS, and JavaScript.
- Backend development using Node.js and Express.js.
- Database management using SQLite.
- User authentication and authorization.
- REST API development.
- CRUD operations.
- Connecting frontend and backend.
- Building responsive web applications.

## 👨‍💻 Author

**Mrunal**

🎓 Computer Science Engineering Student  
🏫 Sandip University, Nashik

## ⭐ Support

If you like this project, don't forget to give this repository a ⭐ on GitHub!

---


  Built with ❤️ by Mrunal
  
  Learning, Building, and Growing Through Code 🚀
