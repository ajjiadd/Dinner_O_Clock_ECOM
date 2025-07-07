document.addEventListener('DOMContentLoaded', () => {
  const adminName = document.getElementById('admin-name');
  const logoutBtn = document.getElementById('admin-logout');

  // Check if current page is the login page
  const isLoginPage = window.location.pathname.includes('admin-login.html');

  // Update admin navigation
  function updateAdminNav() {
    const admin = JSON.parse(localStorage.getItem('adminUser'));
    if (!admin && !isLoginPage) {
      window.location.href = '/admin/admin-login.html';
      return;
    }
    if (admin && adminName) {
      adminName.textContent = `Welcome, ${admin.name}`;
    }
  }

  // Handle logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            alert(data.error);
          } else {
            localStorage.removeItem('adminUser');
            window.location.href = '/admin/admin-login.html';
          }
        })
        .catch(error => {
          console.error('Error logging out:', error);
          alert('Failed to log out. Please try again.');
        });
    });
  }

  // Initialize
  updateAdminNav();
});