document.addEventListener('DOMContentLoaded', () => {
  const messagesTableBody = document.getElementById('messages-table-body');
  const messageModal = document.getElementById('message-modal');
  const messageDetails = document.getElementById('message-details');
  const messageStatus = document.getElementById('message-status');
  const saveStatus = document.getElementById('save-status');
  const closeModal = document.getElementById('close-modal');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  let currentMessageId = null;

  // Toggle sidebar on mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Fetch and display messages
  function loadMessages() {
    fetch('/api/admin/messages', {
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
          console.error('Error fetching messages:', data.error);
          alert(data.error);
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/admin-login.html';
          return;
        }
        console.log('Fetched messages:', data);
        messagesTableBody.innerHTML = '';
        data.forEach(message => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border px-4 py-2">${message.id}</td>
            <td class="border px-4 py-2">${message.name}</td>
            <td class="border px-4 py-2">${message.email}</td>
            <td class="border px-4 py-2">${message.subject.substring(0, 30)}${message.subject.length > 30 ? '...' : ''}</td>
            <td class="border px-4 py-2">${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}</td>
            <td class="border px-4 py-2">${message.status}</td>
            <td class="border px-4 py-2">${new Date(message.created_at).toLocaleString()}</td>
            <td class="border px-4 py-2">
              <button class="view-btn bg-blue-500 text-white px-2 py-1 rounded mr-2" data-id="${message.id}">View</button>
              <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${message.id}">Delete</button>
            </td>
          `;
          messagesTableBody.appendChild(row);
        });

        // Attach event listeners for view and delete buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
          btn.addEventListener('click', () => viewMessage(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', () => deleteMessage(btn.dataset.id));
        });
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
        alert('Failed to load messages. Please try again.');
      });
  }

  // View message details
  function viewMessage(id) {
    fetch(`/api/admin/messages/${id}`, {
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
          console.error('Error fetching message:', data.error);
          alert(data.error);
          return;
        }
        console.log('Fetched message:', data);
        currentMessageId = data.id;
        messageDetails.innerHTML = `
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong> ${data.message}</p>
          <p><strong>Created At:</strong> ${new Date(data.created_at).toLocaleString()}</p>
        `;
        messageStatus.value = data.status;
        messageModal.classList.remove('hidden');
      })
      .catch(error => {
        console.error('Error fetching message:', error);
        alert('Failed to load message details. Please try again.');
      });
  }

  // Update message status
  saveStatus.addEventListener('click', () => {
    if (!currentMessageId) return;
    const status = messageStatus.value;
    fetch(`/api/admin/messages/${currentMessageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
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
          console.error('Error updating message status:', data.error);
          alert(data.error);
        } else {
          alert('Message status updated successfully');
          messageModal.classList.add('hidden');
          loadMessages();
        }
      })
      .catch(error => {
        console.error('Error updating message status:', error);
        alert('Failed to update message status. Please try again.');
      });
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    messageModal.classList.add('hidden');
    currentMessageId = null;
  });

  // Delete message
  function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    fetch(`/api/admin/messages/${id}`, {
      method: 'DELETE',
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
          console.error('Error deleting message:', data.error);
          alert(data.error);
        } else {
          alert('Message deleted successfully');
          loadMessages();
        }
      })
      .catch(error => {
        console.error('Error deleting message:', error);
        alert('Failed to delete message. Please try again.');
      });
  }

  // Initial load
  loadMessages();
});