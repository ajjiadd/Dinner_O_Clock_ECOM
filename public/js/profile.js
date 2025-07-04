document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const addressInput = document.getElementById('address');
  const phoneInput = document.getElementById('phone');
  const updateProfileBtn = document.getElementById('update-profile');

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Please log in to view your profile.');
    window.location.href = 'login.html';
    return;
  }

  // Fetch user data
  fetch('/api/user', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        window.location.href = 'login.html';
      } else {
        nameInput.value = data.user.name;
        emailInput.value = data.user.email;
        addressInput.value = data.user.address || '';
        phoneInput.value = data.user.phone || '';
      }
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      alert('Failed to load profile. Please try again.');
      window.location.href = 'login.html';
    });

  // Update profile
  updateProfileBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
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
    if (!address) {
      alert('Please enter your address.');
      return;
    }
    if (!phone || !/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
      alert('Please enter a valid phone number (format: 123-456-7890).');
      return;
    }

    // Send update request
    fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, address, phone })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          // Update localStorage
          localStorage.setItem('user', JSON.stringify({ id: user.id, name, email }));
          alert('Profile updated successfully!');
        }
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      });
  });
});