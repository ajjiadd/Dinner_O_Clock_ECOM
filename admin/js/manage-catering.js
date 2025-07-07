document.addEventListener('DOMContentLoaded', () => {
  const cateringTableBody = document.getElementById('catering-table-body');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  // Toggle sidebar on mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Fetch and display catering requests
  function loadCateringRequests() {
    fetch('/api/admin/catering', {
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
          return;
        }
        cateringTableBody.innerHTML = '';
        data.forEach(request => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border px-4 py-2">${request.id}</td>
            <td class="border px-4 py-2">${request.user_name}</td>
            <td class="border px-4 py-2">${new Date(request.event_date).toLocaleDateString()}</td>
            <td class="border px-4 py-2">${request.event_type}</td>
            <td class="border px-4 py-2">${request.guest_count}</td>
            <td class="border px-4 py-2">
              <select class="status-select" data-id="${request.id}">
                <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="approved" ${request.status === 'approved' ? 'selected' : ''}>Approved</option>
                <option value="rejected" ${request.status === 'rejected' ? 'selected' : ''}>Rejected</option>
              </select>
            </td>
            <td class="border px-4 py-2">
              <button class="details-btn bg-blue-500 text-white px-2 py-1 rounded" data-id="${request.id}">Details</button>
            </td>
          `;
          cateringTableBody.appendChild(row);
        });

        // Add event listeners for status select and details button
        document.querySelectorAll('.status-select').forEach(select => {
          select.addEventListener('change', () => updateCateringStatus(select.dataset.id, select.value));
        });
        document.querySelectorAll('.details-btn').forEach(btn => {
          btn.addEventListener('click', () => showCateringDetails(btn.dataset.id));
        });
      })
      .catch(error => {
        console.error('Error fetching catering requests:', error);
        alert('Failed to load catering requests. Please try again.');
      });
  }

  // Update catering status
  function updateCateringStatus(id, status) {
    fetch(`/api/admin/catering/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Catering request status updated successfully');
          loadCateringRequests();
        }
      })
      .catch(error => {
        console.error('Error updating catering status:', error);
        alert('Failed to update catering status. Please try again.');
      });
  }

  // Show catering details
  function showCateringDetails(id) {
    fetch(`/api/admin/catering/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        alert(`
          Request ID: ${data.id}
          User: ${data.user_name}
          Event Date: ${new Date(data.event_date).toLocaleDateString()}
          Event Type: ${data.event_type}
          Guest Count: ${data.guest_count}
          Preferences: ${data.preferences || 'None'}
          Status: ${data.status}
        `);
      })
      .catch(error => {
        console.error('Error fetching catering details:', error);
        alert('Failed to load catering details. Please try again.');
      });
  }

  // Initial load
  loadCateringRequests();
});