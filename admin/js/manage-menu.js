document.addEventListener('DOMContentLoaded', () => {
  const menuForm = document.getElementById('menu-form');
  const menuTableBody = document.getElementById('menu-table-body');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const submitButton = document.getElementById('menu-submit');
  const cancelButton = document.getElementById('menu-cancel');

  // Toggle sidebar on mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Fetch and display menu items
  function loadMenuItems() {
    fetch('/api/admin/menu', {
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
          console.error('Error fetching menu items:', data.error);
          alert(data.error);
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/admin-login.html';
          return;
        }
        menuTableBody.innerHTML = '';
        data.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border px-4 py-2">${item.name}</td>
            <td class="border px-4 py-2">$${parseFloat(item.price).toFixed(2)}</td>
            <td class="border px-4 py-2">${item.cuisine_type || '-'}</td>
            <td class="border px-4 py-2">${item.dietary_info || '-'}</td>
            <td class="border px-4 py-2">${item.is_active ? 'Yes' : 'No'}</td>
            <td class="border px-4 py-2">${item.is_featured ? 'Yes' : 'No'}</td>
            <td class="border px-4 py-2">${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" class="h-12 w-12 object-cover">` : '-'}</td>
            <td class="border px-4 py-2">
              <button class="edit-btn bg-blue-500 text-white px-2 py-1 rounded mr-2" data-id="${item.id}">Edit</button>
              <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${item.id}">Delete</button>
            </td>
          `;
          menuTableBody.appendChild(row);
        });

        // Re-attach event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', () => editMenuItem(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', () => deleteMenuItem(btn.dataset.id));
        });
      })
      .catch(error => {
        console.error('Error fetching menu items:', error);
        alert('Failed to load menu items. Please try again.');
      });
  }

  // Handle form submission
  menuForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('menu-id').value;
    const name = document.getElementById('menu-name').value.trim();
    const price = parseFloat(document.getElementById('menu-price').value);
    const cuisine = document.getElementById('menu-cuisine').value.trim() || null;
    const dietary = document.getElementById('menu-dietary').value.trim() || null;
    const description = document.getElementById('menu-description').value.trim() || null;
    const isActive = document.getElementById('menu-active').checked ? 1 : 0;
    const isFeatured = document.getElementById('menu-featured').checked ? 1 : 0;
    const image = document.getElementById('menu-image').files[0];

    if (!name || isNaN(price) || price < 0) {
      alert('Name and a valid price are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('cuisine_type', cuisine);
    formData.append('dietary_info', dietary);
    formData.append('description', description);
    formData.append('is_active', isActive);
    formData.append('is_featured', isFeatured);
    if (image) {
      formData.append('image', image);
    }

    console.log('Submitting form:', { id, name, price, cuisine, dietary, description, isActive, isFeatured, image });

    const url = id ? `/api/admin/menu/${id}` : '/api/admin/menu';
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
      method,
      body: formData,
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
          console.error('Error saving menu item:', data.error);
          alert(data.error);
        } else {
          alert(id ? 'Menu item updated successfully' : 'Menu item added successfully');
          menuForm.reset();
          document.getElementById('menu-id').value = '';
          submitButton.textContent = 'Save';
          cancelButton.classList.add('hidden');
          loadMenuItems();
        }
      })
      .catch(error => {
        console.error('Error saving menu item:', error);
        alert('Failed to save menu item. Please try again.');
      });
  });

  // Edit menu item
  function editMenuItem(id) {
    fetch(`/api/admin/menu/${id}`, {
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
          console.error('Error fetching menu item:', data.error);
          alert(data.error);
          return;
        }
        document.getElementById('menu-id').value = data.id;
        document.getElementById('menu-name').value = data.name;
        document.getElementById('menu-price').value = parseFloat(data.price).toFixed(2);
        document.getElementById('menu-cuisine').value = data.cuisine_type || '';
        document.getElementById('menu-dietary').value = data.dietary_info || '';
        document.getElementById('menu-description').value = data.description || '';
        document.getElementById('menu-active').checked = data.is_active === 1 || data.is_active === true;
        document.getElementById('menu-featured').checked = data.is_featured === 1 || data.is_featured === true;
        document.getElementById('menu-image').value = ''; // Reset file input
        submitButton.textContent = 'Update';
        cancelButton.classList.remove('hidden');
      })
      .catch(error => {
        console.error('Error fetching menu item:', error);
        alert('Failed to load menu item. Please try again.');
      });
  }

  // Cancel edit
  cancelButton.addEventListener('click', () => {
    menuForm.reset();
    document.getElementById('menu-id').value = '';
    submitButton.textContent = 'Save';
    cancelButton.classList.add('hidden');
  });

  // Delete menu item
  function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    fetch(`/api/admin/menu/${id}`, {
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
          console.error('Error deleting menu item:', data.error);
          alert(data.error);
        } else {
          alert('Menu item deleted successfully');
          loadMenuItems();
        }
      })
      .catch(error => {
        console.error('Error deleting menu item:', error);
        alert('Failed to delete menu item. Please try again.');
      });
  }

  // Initial load
  loadMenuItems();
});