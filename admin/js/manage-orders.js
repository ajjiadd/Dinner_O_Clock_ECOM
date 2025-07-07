document.addEventListener('DOMContentLoaded', () => {
  const ordersTableBody = document.getElementById('orders-table-body');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  // Toggle sidebar on mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Fetch and display orders
  function loadOrders() {
    fetch('/api/admin/orders', {
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
          console.error('Error fetching orders:', data.error);
          alert(data.error);
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/admin-login.html';
          return;
        }
        console.log('Fetched orders:', data);
        ordersTableBody.innerHTML = '';
        data.forEach(order => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border px-4 py-2">${order.id}</td>
            <td class="border px-4 py-2">${order.user_name}</td>
            <td class="border px-4 py-2">${new Date(order.order_date).toLocaleDateString()}</td>
            <td class="border px-4 py-2">${order.delivery_type}</td>
            <td class="border px-4 py-2">
              <select class="status-select w-full p-1 border rounded" data-id="${order.id}">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td class="border px-4 py-2">$${parseFloat(order.total_price).toFixed(2)}</td>
            <td class="border px-4 py-2">
              <button class="details-btn bg-blue-500 text-white px-2 py-1 rounded" data-id="${order.id}">Details</button>
            </td>
          `;
          ordersTableBody.appendChild(row);
        });

        // Attach event listeners for status select and details button
        document.querySelectorAll('.status-select').forEach(select => {
          select.addEventListener('change', () => updateOrderStatus(select.dataset.id, select.value));
        });
        document.querySelectorAll('.details-btn').forEach(btn => {
          btn.addEventListener('click', () => showOrderDetails(btn.dataset.id));
        });
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        alert('Failed to load orders. Please try again.');
      });
  }

  // Update order status
  function updateOrderStatus(id, status) {
    if (!['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
      alert('Invalid status selected.');
      return;
    }
    console.log('Updating order status:', { id, status });
    fetch(`/api/admin/orders/${id}`, {
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
          console.error('Error updating order status:', data.error);
          alert(data.error);
        } else {
          alert('Order status updated successfully');
          loadOrders();
        }
      })
      .catch(error => {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
      });
  }

  // Show order details
  function showOrderDetails(id) {
    fetch(`/api/admin/orders/${id}`, {
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
          console.error('Error fetching order details:', data.error);
          alert(data.error);
          return;
        }
        const items = data.items.map(item => `${item.quantity}x ${item.name} ($${parseFloat(item.price).toFixed(2)})`).join('\n');
        alert(`
          Order ID: ${data.id}
          User: ${data.user_name}
          Address: ${data.address || 'N/A'}
          Items:\n${items}
          Total: $${parseFloat(data.total_price).toFixed(2)}
          Payment Method: ${data.payment_method}
          Payment Status: ${data.payment_status}
        `);
      })
      .catch(error => {
        console.error('Error fetching order details:', error);
        alert('Failed to load order details. Please try again.');
      });
  }

  // Initial load
  loadOrders();
});