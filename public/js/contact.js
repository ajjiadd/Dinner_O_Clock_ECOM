document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');
  const submitContactBtn = document.getElementById('submit-contact');
  const cartButton = document.getElementById('cart-button');
  const cartCount = document.getElementById('cart-count');

  // Update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Submit contact form
  submitContactBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();

    // Validation
    if (!name) {
      alert('Please enter your full name.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!subject) {
      alert('Please enter a subject.');
      return;
    }
    if (!message) {
      alert('Please enter a message.');
      return;
    }

    const contactData = {
      user_id: 1, // Hardcoded for demo; set to null or use auth in production
      name,
      email,
      subject,
      message
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert('Message sent successfully! We will respond soon.');
          nameInput.value = '';
          emailInput.value = '';
          subjectInput.value = '';
          messageInput.value = '';
        }
      })
      .catch(error => {
        console.error('Error submitting contact form:', error);
        alert('Failed to send message. Please try again.');
      });
  });

  // Initialize
  updateCartCount();
});