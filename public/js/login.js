document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('login-button');

  // Handle login
  loginButton.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Client-side validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!password) {
      alert('Please enter a password.');
      return;
    }

    // Send login request
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          alert('Login successful!');
          window.location.href = 'index.html';
        }
      })
      .catch(error => {
        console.error('Error logging in:', error);
        alert('Failed to log in. Please try again.');
      });
  });
});