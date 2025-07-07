document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('slider');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let currentIndex = 0;
  let slides = [];

  // Fetch featured menu items for slider
  function loadFeaturedItems() {
    fetch('/api/featured-menu', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched featured items:', data);
        slides = data;
        if (slides.length === 0) {
          slider.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200">No featured dishes available</div>';
          prevBtn.style.display = 'none';
          nextBtn.style.display = 'none';
          return;
        }
        renderSlides();
        showSlide(currentIndex);
        startAutoSlide();
      })
      .catch(error => {
        console.error('Error fetching featured items:', error);
        slider.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200">Failed to load featured dishes</div>';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      });
  }

  // Render slides
  function renderSlides() {
    slider.innerHTML = slides.map(item => `
      <div class="slider-item w-full h-full flex-shrink-0 hidden relative">
        <img src="${item.image_url || '/images/placeholder.jpg'}" alt="${item.name}" class="w-full h-full object-cover">
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
          <h2 class="text-2xl font-bold">${item.name}</h2>
          <p>${item.description ? item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '') : 'No description'}</p>
          <p class="font-semibold">$${parseFloat(item.price).toFixed(2)}</p>
          <a href="order.html" class="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Order Now</a>
        </div>
      </div>
    `).join('');
  }

  // Show specific slide
  function showSlide(index) {
    const slideElements = slider.children;
    if (slideElements.length === 0) return;
    for (let i = 0; i < slideElements.length; i++) {
      slideElements[i].classList.toggle('hidden', i !== index);
    }
    currentIndex = index;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === slideElements.length - 1;
  }

  // Move slide
  function moveSlide(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < slides.length) {
      showSlide(newIndex);
    }
  }

  // Auto-slide every 5 seconds
  function startAutoSlide() {
    if (slides.length > 1) {
      setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
      }, 5000);
    }
  }

  // Event listeners for navigation
  prevBtn.addEventListener('click', () => moveSlide(-1));
  nextBtn.addEventListener('click', () => moveSlide(1));

  // Initial load
  loadFeaturedItems();
});