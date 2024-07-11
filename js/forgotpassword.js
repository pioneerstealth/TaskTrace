import { app, auth, database, sendPasswordResetEmail } from './firebase_config.js';

// Handle forgot password form submission
document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const messageDiv = document.getElementById('message');

  sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log('Password reset email sent successfully to:', email);
      messageDiv.textContent = 'Password reset email sent!';
      messageDiv.style.color = 'green'; // Success message color
    })
    .catch((error) => {
      console.error('Error sending password reset email:', error);
      messageDiv.textContent = `Error: ${error.message}`;
      messageDiv.style.color = 'red'; // Error message color
    });
});
