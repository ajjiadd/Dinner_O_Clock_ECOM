document.addEventListener('DOMContentLoaded', () => {
  const menuItemsContainer = document.getElementById('menu-items');
  const cuisineFilter = document.getElementById('cuisine-filter');
  const dietaryFilter = document.getElementById('dietary-filter');
  const searchBar = document.getElementById('search-bar');
  const loadMoreBtn = document.getElementById('load-more');
  const cartButton = document.getElementById('cart-button');
  const cartCount = document.getElementById('cart-count');
  const cartModal = document.getElementById('cart-modal');
  const cartModalItems = document.getElementById('cart-modal-items');
  const cartModalTotal = document.getElementById('cart-modal-total');
  const closeCartBtn = document.getElementById('close-cart');
  let allMenuItems = [];
  let displayedItems = 0;
  const itemsPerPage = 6;

  // Fetch menu items
  function fetchMenuItems() {
    fetch('/api/menu')
      .then(response => response.json())
      .then(data => {
        allMenuItems = data;
        displayedItems = 0;
        renderMenuItems();
        updateLoadMoreButton();
        updateCartCount();
      })
      .catch(error => {
hello
        console.error('Error fetching menu:', error);
        menuItemsContainer.innerHTML = '<p class="text-center text-red-500">Failed to load menu. Please try again.</p>';
      });
  }

  // Render menu items
  function renderMenuItems() {
    const filteredItems = filterMenuItems();
    menuItemsContainer.innerHTML = filteredItems.slice(0, displayedItems + itemsPerPage).map(item => `
      <div class="menu-card bg-white p-4 rounded-lg shadow-md">
        <img src="${item.image_url}" alt="${item.name}" class="rounded">
        <h3 class="text-xl font-semibold mt-2">${item.name}</h3>
        <p class="text-gray-600">${item.description}</p>
        <p class="font-semibold mt-2">$${item.price}</p>
        <p class="text-sm text-gray-500">${item.cuisine_type} ${item.dietary_info ? `| ${item.dietary_info}` : ''}</p>
        <button class="add-to-cart mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" data-id="${item.id}">Add to Cart</button>
      </div>
    `).join('');
    displayedItems = Math.min(displayedItems + itemsPerPage, filteredItems.length);
    addCartEventListeners();
  }

  // Filter menu items
  function filterMenuItems() {
    const cuisine = cuisineFilter.value;
    const dietary = dietaryFilter.value;
    const search = searchBar.value.toLowerCase();
    return allMenuItems.filter(item => {
      const matchesCuisine = !cuisine || item.cuisine_type === cuisine;
      const matchesDietary = !dietary || item.dietary_info === dietary;
      const matchesSearch = !search || item.name.toLowerCase().includes(search) || item.description.toLowerCase().includes(search);
      return matchesCuisine && matchesDietary && matchesSearch;
    });
  }

  // Update Load More button visibility
  function updateLoadMoreButton() {
    const filteredItems = filterMenuItems();
    loadMoreBtn.classList.toggle('hidden', displayedItems >= filteredItems.length);
  }

  // Add to cart
  function addToCart(itemId) {
    const item = allMenuItems.find(i => i.id === itemId);
    if (!item) return;
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(i => i.id === itemId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert(`${item.name} added to cart!`);
  }

  // Update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Render cart modal
  function renderCartModal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      cartModalItems.innerHTML = '<p class="text-center text-gray-600">Your cart is empty.</p>';
      cartModalTotal.textContent = 'Total: $0.00';
      return;
    }
    cartModalItems.innerHTML = cart.map(item => `
      <div class="flex justify-between items-center border-b py-2">
        <div>
          <h4 class="text-lg font-semibold">${item.name}</h4>
          <p class="text-gray-600">$${item.price} x 
          <input type="number" min="1" value="${item.quantity}" class="w-16 p-1 border rounded cart-quantity" data-id="${item.id}">
          </p>
        </div>
        <div class="flex items-center">
          <p class="font-semibold mr-4">$${(item.price * item.quantity).toFixed(2)}</p>
          <button class="remove-from-cart text-red-600 hover:text-red-800" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartModalTotal.textContent = `Total: $${total.toFixed(2)}`;
    addCartModalEventListeners();
  }

  // Add event listeners for cart buttons
  function addCartEventListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', () => {
        const itemId = parseInt(button.getAttribute('data-id'));
        addToCart(itemId);
      });
    });
  }

  // Add event listeners for cart modal
  function addCartModalEventListeners() {
    document.querySelectorAll('.cart-quantity').forEach(input => {
      input.addEventListener('change', (e) => {
        const itemId = parseInt(e.target.getAttribute('data-id'));
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const item = cart.find(i => i.id === itemId);
        if (item) {
          item.quantity = parseInt(e.target.value) || 1;
          localStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
          renderCartModal();
        }
      });
    });
    document.querySelectorAll('.remove-from-cart').forEach(button => {
      button.addEventListener('click', () => {
        const itemId = parseInt(button.getAttribute('data-id'));
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(i => i.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartModal();
      });
    });
  }

  // Cart modal toggle
  cartButton.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
    renderCartModal();
  });
  closeCartBtn.addEventListener('click', () => {
    cartModal.classList.add('hidden');
  });

  // Event listeners for filters and search
  cuisineFilter.addEventListener('change', () => {
    displayedItems = 0;
    renderMenuItems();
    updateLoadMoreButton();
  });
  dietaryFilter.addEventListener('change', () => {
    displayedItems = 0;
    renderMenuItems();
    updateLoadMoreButton();
  });
  searchBar.addEventListener('input', () => {
    displayedItems = 0;
    renderMenuItems();
    updateLoadMoreButton();
  });
  loadMoreBtn.addEventListener('click', () => {
    renderMenuItems();
    updateLoadMoreButton();
  });

  // Initialize
  fetchMenuItems();
});