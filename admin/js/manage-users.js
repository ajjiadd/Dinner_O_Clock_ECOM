document.addEventListener('DOMContentLoaded', () => {
  const userForm = document.getElementById('user-form');
  const usersTableBody = document.getElementById('users-table-body');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const submitButton = document.getElementById('user-submit');
  const cancelButton = document.getElementById('user-cancel');

  // Toggle sidebar on mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Fetch and display users
  function loadUsers() {
    fetch('/api/admin/users', {
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
          console.error('Error fetching users:', data.error);
          alert(data.error);
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/admin-login.html';
          return;
        }
        console.log('Fetched users:', data);
        usersTableBody.innerHTML = '';
        data.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border px-4 py-2">${user.id}</td>
            <td class="border px-4 py-2">${user.name}</td>
            <td class="border px-4 py-2">${user.email}</td>
            <td class="border px-4 py-2">${user.phone || '-'}</td>
            <td class="border px-4 py-2">${user.address || '-'}</td>
            <td class="border px-4 py-2">
              <button class="edit-btn bg-blue-500 text-white px-2 py-1 rounded mr-2" data-id="${user.id}">Edit</button>
              <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${user.id}">Delete</button>
            </td>
          `;
          usersTableBody.appendChild(row);
        });

        // Attach event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', () => editUser(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', () => deleteUser(btn.dataset.id));
        });
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        alert('Failed to load users. Please try again.');
      });
  }

  // Handle form submission
  userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value.trim();
    const phone = document.getElementById('user-phone').value.trim() || null;
    const address = document.getElementById('user-address').value.trim() || null;

    if (!name || !email || (!id && !password)) {
      alert('Name, email, and password (for new users) are required.');
      return;
    }

    const data = { name, email, phone, address };
    if (password) data.password = password;

    console.log('Submitting user:', { id, ...data });

    const url = id ? `/api/admin/users/${id}` : '/api/admin/users';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.error('Error saving user:', data.error);
          alert(data.error);
        } else {
          alert(id ? 'User updated successfully' : 'User added successfully');
          userForm.reset();
          document.getElementById('user-id').value = '';
          submitButton.textContent = 'Save';
          cancelButton.classList.add('hidden');
          loadUsers();
        }
      })
      .catch(error => {
        console.error('Error saving user:', error);
        alert('Failed to save user. Please try again.');
      });
  });

  // Edit user
  function editUser(id) {
    fetch(`/api/admin/users/${id}`, {
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
          console.error('Error fetching user:', data.error);
          alert(data.error);
          return;
        }
        document.getElementById('user-id').value = data.id;
        document.getElementById('user-name').value = data.name;
        document.getElementById('user-email').value = data.email;
        document.getElementById('user-password').value = '';
        document.getElementById('user-phone').value = data.phone || '';
        document.getElementById('user-address').value = data.address || '';
        submitButton.textContent = 'Update';
        cancelButton.classList.remove('hidden');
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        alert('Failed to load user. Please try again.');
      });
  }

  // Cancel edit
  cancelButton.addEventListener('click', () => {
    userForm.reset();
    document.getElementById('user-id').value = '';
    submitButton.textContent = 'Save';
    cancelButton.classList.add('hidden');
  });

  // Delete user
  function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    fetch(`/api/admin/users/${id}`, {
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
          console.error('Error deleting user:', data.error);
          alert(data.error);
        } else {
          alert('User deleted successfully');
          loadUsers();
        }
      })
      .catch(error => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      });
  }

  // Initial load
  loadUsers();
});