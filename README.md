ChatApp
ChatApp is a real-time messaging application that allows users to start conversations, send messages, and manage active users. Built with React, Socket.IO, and Axios, it provides a seamless chat experience.

Features
Real-time messaging
User management
Conversation history
Initial message functionality
Active user notifications
Installation

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

User Routes
GET /
Description: Retrieve a list of all users.
Auth Required: Yes (Authenticated users only)
Controller: UsersController.getUsers

GET /:id
Description: Retrieve a specific user by ID.
Auth Required: Yes (Authenticated users only)
Controller: UsersController.getUserById

POST /signup
Description: Create a new user account.
Auth Required: No
Controller: UsersController.createUsers

POST /login
Description: Log in a user and return an authentication token.
Auth Required: No
Controller: UsersController.login

Conversation Routes
POST /startconvo
Description: Start a new conversation between users.
Auth Required: Yes (Authenticated users only)
Controller: UsersController.createConversation

GET /getconvo/:id
Description: Retrieve conversation details by ID.
Auth Required: Yes (Authenticated users only)
Controller: UsersController.getConvo

Message Routes
POST /sendMessage
Description: Send a new message in a conversation.
Auth Required: Yes (Authenticated users only)
Controller: UsersController.sendMessage

GET /getMessage/:id
Description: Retrieve messages for a specific user.
Auth Required: Yes (Authenticated users only)
Controller: UsersController.getUserMessages

Password Management Routes
POST /forgetpassword
Description: Request a password reset link.
Auth Required: No
Controller: UsersController.forgotPassword

POST /resetpassword
Description: Reset the user's password.
Auth Required: Yes (Authenticated users only)
Controller: UsersController.resetPassword

Socket Events
connection: When a user connects
disconnect: When a user disconnects
message: When a new message is received
userUpdate: When active users are updated

Acknowledgments
React
Socket.IO
Axios
