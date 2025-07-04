document.addEventListener('DOMContentLoaded', () => {
  const authLinks = document.getElementById('auth-links');
  const cartButton = document.getElementById('cart-button');
  const cartCount = document.getElementById('cart-count');

  // Update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Update navigation based on login status
  function updateNavigation() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      authLinks.innerHTML = `
        <a href="profile.html" class="hover:underline">Profile</a>
        <span class="text-white">Welcome, ${user.name}</span>
        <a href="logout.html" class="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200">Logout</a>
      `;
    } else {
      authLinks.innerHTML = `
        <a href="login.html" class="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200">Login</a>
      `;
    }
  }

  // Initialize
  updateCartCount();
  updateNavigation();
});