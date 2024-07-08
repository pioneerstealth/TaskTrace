As a software architect specializing in web development, I'll analyze your requirements and provide a solution. Given the constraints and requirements, here's my assessment:

1. Requirements analysis:
   - Admin creates tasks with timer and description
   - Tasks are propagated to users
   - Users submit images
   - Submission time is recorded and displayed to admin
   - Preference to avoid backend

2. Challenge:
The main challenge here is real-time data synchronization between admin and users without a backend. This is difficult to achieve reliably and securely using only frontend technologies.

3. Solution:
While it's possible to create a simplified version of this system using only frontend technologies, I strongly recommend using a backend for several reasons:

   a. Data persistence: Without a backend, data will be lost when the browser is closed or refreshed.
   b. Security: Storing sensitive data or enforcing access controls is challenging without a backend.
   c. Real-time synchronization: Implementing reliable real-time updates across multiple clients is complex without a server.
   d. Scalability: As your application grows, a backend will be necessary for proper data management and performance.

Given these considerations, here's a recommended architecture:

1. Frontend:
   - React or Vue.js for the user interface
   - Redux or Vuex for state management

2. Backend:
   - Node.js with Express.js for API endpoints
   - WebSocket (Socket.io) for real-time communication

3. Database:
   - MongoDB or Firebase Realtime Database for flexible, real-time data storage

4. Authentication:
   - JWT (JSON Web Tokens) for secure authentication

5. Hosting:
   - Vercel or Netlify for frontend hosting
   - Heroku or DigitalOcean for backend hosting

Implementation steps:

1. Set up the backend API with Node.js and Express.js
2. Implement WebSocket connections for real-time updates
3. Create database schemas for tasks and image submissions
4. Develop frontend components for admin and user interfaces
5. Implement state management for local data handling
6. Set up authentication for admin and user roles
7. Connect frontend to backend API and WebSocket
8. Implement real-time updates for task creation and image submission

This architecture allows for:
- Secure data storage and retrieval
- Real-time updates between admin and users
- Scalability as your application grows
- Proper separation of concerns between frontend and backend

While it's possible to create a simplified version using only frontend technologies (e.g., using LocalStorage for data persistence and Firebase for real-time updates), I strongly advise against this approach for a production application due to limitations in security, scalability, and data integrity.

Let me know if you need more details on any specific part of this architecture or if you have any questions about the implementation.