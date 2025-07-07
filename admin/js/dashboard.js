document.addEventListener('DOMContentLoaded', () => {
  const totalOrders = document.getElementById('total-orders');
  const totalRevenue = document.getElementById('total-revenue');
  const pendingCatering = document.getElementById('pending-catering');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  // Toggle sidebar on mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Fetch dashboard metrics
  fetch('/api/admin/dashboard', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/admin-login.html';
      } else {
        totalOrders.textContent = data.totalOrders;
        totalRevenue.textContent = `$${data.totalRevenue.toFixed(2)}`;
        pendingCatering.textContent = data.pendingCatering;

        // Render order trends chart
        const ctx = document.getElementById('order-chart').getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
              label: 'Orders per Month',
              data: data.orderTrends,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
          }
        });
      }
    })
    .catch(error => {
      console.error('Error fetching dashboard data:', error);
      alert('Failed to load dashboard. Please try again.');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/admin-login.html';
    });
});