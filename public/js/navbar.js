document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const authLinks = document.getElementById('auth-links');
  const mobileAuthLinks = document.getElementById('mobile-auth-links');
  const cartCount = document.getElementById('cart-count');
  const mobileCartCount = document.getElementById('mobile-cart-count');
  const cartButton = document.getElementById('cart-button');
  const mobileCartButton = document.getElementById('mobile-cart-button');

  // Toggle mobile menu
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Sync auth links
  function syncAuthLinks() {
    if (authLinks && mobileAuthLinks) {
      mobileAuthLinks.innerHTML = authLinks.innerHTML;
    }
  }

  // Sync cart count
  function syncCartCount() {
    if (cartCount && mobileCartCount) {
      mobileCartCount.textContent = cartCount.textContent;
    }
  }

  // Sync cart button click
  if (cartButton && mobileCartButton) {
    mobileCartButton.addEventListener('click', () => {
      cartButton.click(); // Trigger desktop cart button's event
    });
  }

  // Observe changes to auth-links and cart-count
  if (authLinks) {
    const authObserver = new MutationObserver(syncAuthLinks);
    authObserver.observe(authLinks, { childList: true, subtree: true });
  }
  if (cartCount) {
    const cartObserver = new MutationObserver(syncCartCount);
    cartObserver.observe(cartCount, { childList: true, characterData: true });
  }

  // Initial sync
  syncAuthLinks();
  syncCartCount();

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
});