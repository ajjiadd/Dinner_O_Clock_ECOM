document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const addressInput = document.getElementById('address');
  const phoneInput = document.getElementById('phone');
  const signupButton = document.getElementById('signup-button');

  // Handle signup
  signupButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const address = addressInput.value.trim();
    const phone = phoneInput.value.trim();

    // Client-side validation
    if (!name) {
      alert('Please enter your full name.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      alert('Please enter a password with at least 6 characters.');
      return;
    }
    if (!address) {
      alert('Please enter your address.');
      return;
    }
    // if (!phone || !/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
    //   alert('Please enter a valid phone number (format: 123-456-7890).');
    //   return;
    // }

    // Send signup request
    fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, address, phone })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Account created successfully! Please log in.');
          window.location.href = 'login.html';
        }
      })
      .catch(error => {
        console.error('Error signing up:', error);
        alert('Failed to sign up. Please try again.');
      });
  });
});