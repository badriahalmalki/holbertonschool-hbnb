document.addEventListener('DOMContentLoaded', () => {
  // =============================
  // 2a – Shared globals & utilities
  // =============================
  const API_URL = 'http://127.0.0.1:5000';

  function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split(';').map(c => c.trim()) : [];
    for (const c of cookies) {
      const [k, ...v] = c.split('=');
      if (k === name) return decodeURIComponent(v.join('='));
    }
    return null;
  }

  function getPlaceIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
  }

  // =============================
  // 2b – Task 1: Login page
  // =============================
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'index.html';
      } else {
        alert('Login failed: ' + res.statusText);
      }
    });
  }

  // =============================
  // 2c – Task 2: Index page
  // =============================
  const placesList = document.getElementById('places-list');
  if (placesList) {
    const token = getCookie('token');

    const loginLink = document.getElementById('login-link');
    if (loginLink) loginLink.style.display = token ? 'none' : 'block';

    const priceFilter = document.getElementById('price-filter');
    ['10', '50', '100', 'All'].forEach(val => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val === 'All' ? 'All' : `$${val}`;
      priceFilter.appendChild(opt);
    });

    let allPlaces = [];

    async function fetchPlaces() {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/v1/places/`, { headers });
      if (!res.ok) return;

      allPlaces = await res.json();
      displayPlaces(allPlaces);
    }

    function displayPlaces(places) {
      placesList.innerHTML = '';
      places.forEach(place => {
        const card = document.createElement('div');
        card.className = 'place-card';
        card.innerHTML = `
          <h3>${place.title}</h3>
          <p>Price per night: $${place.price}</p>
          <a href="place.html?id=${place.id}" class="details-button">View Details</a>
        `;
        placesList.appendChild(card);
      });
    }

    priceFilter.addEventListener('change', (e) => {
      const val = e.target.value;
      const filtered = val === 'All'
        ? allPlaces
        : allPlaces.filter(p => p.price <= Number(val));
      displayPlaces(filtered);
    });

    fetchPlaces();
  }

  // =============================
  // 2d – Task 3: Place Details page
  // =============================
  const placeDetails = document.getElementById('place-details');
  if (placeDetails) {
    const token = getCookie('token');
    const placeId = getPlaceIdFromURL();
    const addReviewSection = document.getElementById('add-review');

    if (!token && addReviewSection) addReviewSection.style.display = 'none';

    async function fetchPlaceDetails() {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/v1/places/${encodeURIComponent(placeId)}`, { headers });
      if (!res.ok) return;

      const place = await res.json();
      displayPlaceDetails(place);
      displayReviews(place.reviews || []);
    }

    function displayPlaceDetails(place) {
      const titleEl = document.getElementById('place-title');
      if (titleEl) titleEl.textContent = place.title || '';

      placeDetails.innerHTML = `
        <div class="place-info" style="text-align: center;">
          <h2>${place.title}</h2>
          <p><strong>Host:</strong> <span style="color: teal;">${place.owner ? place.owner.first_name + ' ' + place.owner.last_name : place.owner_id}</span></p>
          <p><strong>Price per night:</strong> <span style="color: green;">$${place.price}</span></p>
          <p><strong>Description:</strong> <span style="color: #555;">${place.description || ''}</span></p>
          <p><strong>Amenities:</strong> <span style="color: purple;">${(place.amenities || []).join(', ') || 'None'}</span></p>
        </div>
      `;
    }

    function displayReviews(reviews) {
      const reviewsSection = document.getElementById('reviews');
      reviewsSection.innerHTML = '<h2>Reviews</h2>';

      if (!reviews.length) {
        reviewsSection.innerHTML += '<p>No reviews yet.</p>';
        return;
      }

      reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';

        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

        card.innerHTML = `
          <p><strong>${r.user_name || 'Anonymous'}:</strong></p>
          <p>${r.text}</p>
          <p>${stars}</p>
        `;

        reviewsSection.appendChild(card);
      });
    }

    const reviewForm = document.getElementById('review-form');
    if (reviewForm && token) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = reviewForm.querySelector('textarea').value.trim();
        const ratingEl = reviewForm.querySelector('select#rating');
        const rating = ratingEl ? Number(ratingEl.value) : null;

        if (!text || !rating) {
          alert('Please fill out review and rating.');
          return;
        }

        const res = await fetch(`${API_URL}/api/v1/reviews/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text, rating, place_id: placeId })
        });

        if (res.ok) {
          alert('Review submitted!');
          fetchPlaceDetails();
        } else {
          alert('Failed to submit review: ' + res.statusText);
        }
      });
    }

    if (placeId) fetchPlaceDetails();
  }

  // =============================
  // 2e – Task 4: Add Review page
  // =============================
  const reviewFormPage = document.getElementById('review-form');
  const placeNameEl = document.getElementById('place-name');

  if (reviewFormPage && placeNameEl) {
    const token = getCookie('token');
    const placeId = getPlaceIdFromURL();

    if (!token) {
      window.location.href = 'index.html';
      return;
    }

    async function showPlaceName() {
      placeNameEl.textContent = 'Loading place...';
      try {
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
        const res = await fetch(`${API_URL}/api/v1/places/${encodeURIComponent(placeId)}`, { headers });
        if (!res.ok) {
          placeNameEl.textContent = 'Place name unavailable';
          return;
        }
        const place = await res.json();
        placeNameEl.textContent = `Reviewing: ${place.title || 'Unknown place'}`;
      } catch {
        placeNameEl.textContent = 'Place name unavailable';
      }
    }

    reviewFormPage.addEventListener('submit', async (e) => {
      e.preventDefault();

      const text = reviewFormPage.querySelector('textarea').value.trim();
      const ratingEl = reviewFormPage.querySelector('#rating');
      const rating = ratingEl ? Number(ratingEl.value) : null;

      if (!text || !rating) {
        alert('Please fill out review and rating.');
        return;
      }

      const res = await fetch(`${API_URL}/api/v1/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, rating, place_id: placeId })
      });

      if (res.ok) {
        alert('Review submitted successfully!');
        reviewFormPage.reset();
      } else {
        alert('Failed to submit review: ' + res.statusText);
      }
    });

    if (placeId) showPlaceName();
  }
});
