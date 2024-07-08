import { app, auth, database } from './firebase_config.js';

document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-div').style.display = 'none';
    document.getElementById('forgot-password-div').style.display = 'block';
  });

  // Handle forgot password form submission
  document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('message');

    auth.sendPasswordResetEmail(email)
      .then(() => {
        messageDiv.textContent = 'Password reset email sent!';
      })
      .catch((error) => {
        messageDiv.textContent = `Error: ${error.message}`;
      });
  });