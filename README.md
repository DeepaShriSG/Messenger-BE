ChatApp
ChatApp is a real-time messaging application that allows users to start conversations, send messages, and manage active users. Built with React, Socket.IO, and Axios, it provides a seamless chat experience.

Features
Real-time messaging
User management
Conversation history
Initial message functionality
Active user notifications
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/chatapp.git
cd chatapp
Install dependencies:

bash
Copy code
npm install
Create a .env file in the root directory and add your environment variables. Example:


Start the development server:

bash
Copy code
npm start
The app should now be running on http://localhost:3000.

Dependencies
Here are the key dependencies used in the project:

bcryptjs: ^2.4.3
cors: ^2.8.5
dotenv: ^16.4.5
express: ^4.19.2
jsonwebtoken: ^9.0.2
mongoose: ^8.5.1
nodemailer: ^6.9.14
nodemon: ^3.1.4
socket.io: ^4.7.5
validator: ^13.12.0
Usage
Create a new user account or log in if you already have one.
Start a conversation by selecting a user from the active users list.
Send messages in the conversation window.
View conversation history and manage ongoing conversations.
API Endpoints
POST /api/conversations: Create a new conversation
POST /api/messages: Send a new message
GET /api/conversations/
: Get messages for a conversation
Socket Events
connection: When a user connects
disconnect: When a user disconnects
message: When a new message is received
userUpdate: When active users are updated
Contributing
If you want to contribute to ChatApp, follow these steps:

Fork the repository
Create a new branch (git checkout -b feature-branch)
Make your changes
Commit your changes (git commit -am 'Add new feature')
Push to the branch (git push origin feature-branch)
Create a new Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
React
Socket.IO
Axios
