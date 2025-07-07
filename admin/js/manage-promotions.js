document.addEventListener('DOMContentLoaded', () => {
  const promotionForm = document.getElementById('promotion-form');
  const promotionsTableBody = document.getElementById('promotions-table-body');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const submitButton = document.getElementById('promotion-submit');
  const cancelButton = document.getElementById('promotion-cancel');

  // Toggle sidebar on mobile
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  // Fetch and display promotions
  function loadPromotions() {
    fetch('/api/admin/promotions', {
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
          console.error('Error fetching promotions:', data.error);
          alert(data.error);
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/admin-login.html';
          return;
        }
        console.log('Fetched promotions:', data);
        promotionsTableBody.innerHTML = '';
        data.forEach(promotion => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="border px-4 py-2">${promotion.id}</td>
            <td class="border px-4 py-2">${promotion.title}</td>
            <td class="border px-4 py-2">${promotion.description.substring(0, 50)}${promotion.description.length > 50 ? '...' : ''}</td>
            <td class="border px-4 py-2">
              ${promotion.image_url ? `<img src="${promotion.image_url}" alt="${promotion.title}" class="h-16 w-16 object-cover rounded">` : '-'}
            </td>
            <td class="border px-4 py-2">${promotion.is_active ? 'Yes' : 'No'}</td>
            <td class="border px-4 py-2">
              <button class="edit-btn bg-blue-500 text-white px-2 py-1 rounded mr-2" data-id="${promotion.id}">Edit</button>
              <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" data-id="${promotion.id}">Delete</button>
            </td>
          `;
          promotionsTableBody.appendChild(row);
        });

        // Attach event listeners for edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', () => editPromotion(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', () => deletePromotion(btn.dataset.id));
        });
      })
      .catch(error => {
        console.error('Error fetching promotions:', error);
        alert('Failed to load promotions. Please try again.');
      });
  }

  // Handle form submission
  promotionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('promotion-id').value;
    const title = document.getElementById('promotion-title').value.trim();
    const description = document.getElementById('promotion-description').value.trim();
    const image = document.getElementById('promotion-image').files[0];
    const imageUrl = document.getElementById('promotion-image-url').value;
    const isActive = document.getElementById('promotion-is-active').checked;

    if (!title || !description) {
      alert('Title and description are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('is_active', isActive ? 1 : 0);
    if (image) {
      formData.append('image', image);
    } else if (imageUrl) {
      formData.append('image_url', imageUrl);
    }

    console.log('Submitting promotion:', { id, title, description, is_active: isActive });

    const url = id ? `/api/admin/promotions/${id}` : '/api/admin/promotions';
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
          console.error('Error saving promotion:', data.error);
          alert(data.error);
        } else {
          alert(id ? 'Promotion updated successfully' : 'Promotion added successfully');
          promotionForm.reset();
          document.getElementById('promotion-id').value = '';
          document.getElementById('promotion-image-url').value = '';
          submitButton.textContent = 'Save';
          cancelButton.classList.add('hidden');
          loadPromotions();
        }
      })
      .catch(error => {
        console.error('Error saving promotion:', error);
        alert('Failed to save promotion. Please try again.');
      });
  });

  // Edit promotion
  function editPromotion(id) {
    fetch(`/api/admin/promotions/${id}`, {
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
          console.error('Error fetching promotion:', data.error);
          alert(data.error);
          return;
        }
        document.getElementById('promotion-id').value = data.id;
        document.getElementById('promotion-title').value = data.title;
        document.getElementById('promotion-description').value = data.description;
        document.getElementById('promotion-image-url').value = data.image_url || '';
        document.getElementById('promotion-image').value = '';
        document.getElementById('promotion-is-active').checked = data.is_active;
        submitButton.textContent = 'Update';
        cancelButton.classList.remove('hidden');
      })
      .catch(error => {
        console.error('Error fetching promotion:', error);
        alert('Failed to load promotion. Please try again.');
      });
  }

  // Cancel edit
  cancelButton.addEventListener('click', () => {
    promotionForm.reset();
    document.getElementById('promotion-id').value = '';
    document.getElementById('promotion-image-url').value = '';
    submitButton.textContent = 'Save';
    cancelButton.classList.add('hidden');
  });

  // Delete promotion
  function deletePromotion(id) {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    fetch(`/api/admin/promotions/${id}`, {
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
          console.error('Error deleting promotion:', data.error);
          alert(data.error);
        } else {
          alert('Promotion deleted successfully');
          loadPromotions();
        }
      })
      .catch(error => {
        console.error('Error deleting promotion:', error);
        alert('Failed to delete promotion. Please try again.');
      });
  }

  // Initial load
  loadPromotions();
});