document.addEventListener('DOMContentLoaded', () => {
  const subscriptionsTableBody = document.getElementById('subscriptions-table-body');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  // Toggle sidebar on mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Fetch and display subscriptions
  function loadSubscriptions() {
    fetch('/api/admin/subscriptions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.error('Error fetching subscriptions:', data.error);
          alert(data.error);
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/admin-login.html';
          return;
        }
        console.log('Fetched subscriptions:', data);
        subscriptionsTableBody.innerHTML = '';
        data.forEach(subscription => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border px-4 py-2">${subscription.id}</td>
            <td class="border px-4 py-2">${subscription.user_name}</td>
            <td class="border px-4 py-2">${subscription.plan_type}</td>
            <td class="border px-4 py-2">${subscription.days || '-'}</td>
            <td class="border px-4 py-2">${new Date(subscription.start_date).toLocaleDateString()}</td>
            <td class="border px-4 py-2">${subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : '-'}</td>
            <td class="border px-4 py-2">
              <select class="status-select w-full p-1 border rounded" data-id="${subscription.id}">
                <option value="active" ${subscription.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="paused" ${subscription.status === 'paused' ? 'selected' : ''}>Paused</option>
                <option value="cancelled" ${subscription.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td class="border px-4 py-2">
              <button class="update-btn bg-blue-500 text-white px-2 py-1 rounded" data-id="${subscription.id}">Update</button>
            </td>
          `;
          subscriptionsTableBody.appendChild(row);
        });

        // Attach event listeners for update buttons
        document.querySelectorAll('.status-select').forEach(select => {
          select.addEventListener('change', () => {
            const button = select.parentElement.nextElementSibling.querySelector('.update-btn');
            button.classList.add('bg-blue-600');
            button.textContent = 'Save';
          });
        });
        document.querySelectorAll('.update-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const select = btn.parentElement.previousElementSibling.querySelector('.status-select');
            updateSubscriptionStatus(btn.dataset.id, select.value);
          });
        });
      })
      .catch(error => {
        console.error('Error fetching subscriptions:', error);
        alert('Failed to load subscriptions. Please try again.');
      });
  }

  // Update subscription status
  function updateSubscriptionStatus(id, status) {
    if (!['active', 'paused', 'cancelled'].includes(status)) {
      alert('Invalid status selected.');
      return;
    }
    console.log('Updating subscription status:', { id, status });
    fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.error('Error updating subscription status:', data.error);
          alert(data.error);
        } else {
          alert('Subscription status updated successfully');
          loadSubscriptions();
        }
      })
      .catch(error => {
        console.error('Error updating subscription status:', error);
        alert('Failed to update subscription status. Please try again.');
      });
  }

  // Initial load
  loadSubscriptions();
});