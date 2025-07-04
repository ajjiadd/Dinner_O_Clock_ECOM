document.addEventListener('DOMContentLoaded', () => {
  // Trigger logout
  fetch('/api/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        // Clear localStorage
        localStorage.removeItem('user');
        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      }
    })
    .catch(error => {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    });
});