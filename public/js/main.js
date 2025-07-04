document.addEventListener('DOMContentLoaded', () => {
  // Hero Slider
  const slider = document.getElementById('slider');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentIndex = 0;
  let slides = [];

  // Fetch featured menu items for slider
  fetch('/api/featured-menu')
    .then(response => response.json())
    .then(data => {
      slides = data;
      renderSlides();
      startAutoSlide();
    })
    .catch(error => console.error('Error fetching menu:', error));

  function renderSlides() {
    slider.innerHTML = slides.map(item => `
      <div class="slider-item w-full h-full relative">
        <img src="${item.image_url}" alt="${item.name}" class="w-full h-full">
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <h2 class="text-2xl font-bold">${item.name}</h2>
          <p>${item.description}</p>
          <p class="font-semibold">$${item.price}</p>
          <a href="order.html" class="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Order Now</a>
        </div>
      </div>
    `).join('');
    slider.style.transform = `translateX(0)`;
  }

  function moveSlide(direction) {
    currentIndex = (currentIndex + direction + slides.length) % slides.length;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function startAutoSlide() {
    setInterval(() => moveSlide(1), 5000);
  }

  prevBtn.addEventListener('click', () => moveSlide(-1));
  nextBtn.addEventListener('click', () => moveSlide(1));

  // Featured Dishes
  const featuredDishes = document.getElementById('featured-dishes');
  fetch('/api/featured-menu')
    .then(response => response.json())
    .then(data => {
      featuredDishes.innerHTML = data.map(item => `
        <div class="featured-dish bg-white p-4 rounded-lg shadow-md">
          <img src="${item.image_url}" alt="${item.name}" class="rounded">
          <h3 class="text-xl font-semibold mt-2">${item.name}</h3>
          <p class="text-gray-600">${item.description}</p>
          <p class="font-semibold mt-2">$${item.price}</p>
        </div>
      `).join('');
    })
    .catch(error => console.error('Error fetching featured dishes:', error));

  // Testimonials
  const testimonials = document.getElementById('testimonials');
  fetch('/api/testimonials')
    .then(response => response.json())
    .then(data => {
      testimonials.innerHTML = data.map(item => `
        <div class="testimonial-card bg-white p-6 rounded-lg shadow-md">
          <p class="text-gray-600">"${item.content}"</p>
          <p class="mt-2 font-semibold">Rating: ${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</p>
        </div>
      `).join('');
    })
    .catch(error => console.error('Error fetching testimonials:', error));

  // Promotions
  const promotions = document.getElementById('promotions');
  fetch('/api/promotions')
    .then(response => response.json())
    .then(data => {
      promotions.innerHTML = data.map(item => `
        <div class="promotion-card bg-white p-4 rounded-lg shadow-md">
          <img src="${item.image_url}" alt="${item.title}" class="rounded">
          <h3 class="text-xl font-semibold mt-2">${item.title}</h3>
          <p class="text-gray-600">${item.description}</p>
        </div>
      `).join('');
    })
    .catch(error => console.error('Error fetching promotions:', error));

  // Newsletter Signup
  const newsletterSubmit = document.getElementById('newsletter-submit');
  newsletterSubmit.addEventListener('click', () => {
    const email = document.getElementById('newsletter-email').value;
    if (email) {
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error subscribing:', error));
    } else {
      alert('Please enter a valid email.');
    }
  });
});