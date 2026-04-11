/* add-review.js
   Task 4:
   - checkAuthentication: redirect to index.html if no token
   - getPlaceIdFromURL: read id from query string
   - show place name in #place-name by fetching GET /api/v1/places/<id>
   - submit review: POST /api/v1/reviews/ with { text, rating, place_id } and Authorization header
   On success: alert and clear form; on failure: alert.
   Assumes API_URL and (optionally) getCookie(name) are available globally.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Safe cookie getter (use global getCookie if provided)
  const getCookieSafe = (name) => {
    if (typeof getCookie === 'function') return getCookie(name);
    const cookies = document.cookie ? document.cookie.split(';').map(c => c.trim()) : [];
    for (const c of cookies) {
      const [k, ...v] = c.split('=');
      if (k === name) return decodeURIComponent(v.join('='));
    }
    return null;
  };

  function getPlaceIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
  }

  // If not authenticated, redirect to index.html
  function checkAuthentication() {
    const token = getCookieSafe('token');
    if (!token) {
      window.location.href = 'index.html';
      return null;
    }
    return token;
  }

  // Populate #place-name by fetching place details
  async function showPlaceName(token, placeId) {
    const placeNameEl = document.getElementById('place-name');
    if (!placeNameEl) return;
    placeNameEl.textContent = 'Loading place...';

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/v1/places/${encodeURIComponent(placeId)}`, { headers });
      if (!res.ok) {
        placeNameEl.textContent = 'Place name unavailable';
        return;
      }
      const data = await res.json();
      const place = data && data.place ? data.place : data;
      placeNameEl.textContent = place && place.name ? `Reviewing: ${place.name}` : 'Reviewing: Unknown place';
    } catch (err) {
      placeNameEl.textContent = 'Place name unavailable';
    }
  }

  // Submit review
  async function submitReview(token, placeId, text, rating) {
    try {
      const body = {
        text,
        rating,
        place_id: placeId
      };

      const res = await fetch(`${API_URL}/api/v1/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        let msg = res.statusText || `HTTP ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody && (errBody.message || errBody.error)) {
            msg = errBody.message || errBody.error;
          }
        } catch (e) {
          // ignore parse errors
        }
        alert('Failed to submit review: ' + msg);
        return false;
      }

      alert('Review submitted successfully!');
      return true;
    } catch (err) {
      alert('Failed to submit review: ' + (err && err.message ? err.message : 'Network error'));
      return false;
    }
  }

  // Wire up form
  (function init() {
    const placeId = getPlaceIdFromURL();
    if (!placeId) {
      const placeNameEl = document.getElementById('place-name');
      if (placeNameEl) placeNameEl.textContent = 'Missing place id';
      return;
    }

    const token = checkAuthentication();
    if (!token) return;

    showPlaceName(token, placeId);

    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;

    // Ensure rating select has options 1-5 if not already populated
    const ratingSelect = document.getElementById('rating');
    if (ratingSelect && ratingSelect.children.length === 0) {
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Select rating';
      ratingSelect.appendChild(defaultOpt);
      for (let i = 1; i <= 5; i++) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = String(i);
        ratingSelect.appendChild(opt);
      }
    }

    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const textEl = reviewForm.querySelector('textarea[name="review-text"], textarea#review, textarea[name="review"]');
      const ratingEl = reviewForm.querySelector('select[name="rating"], select#rating');

      const text = textEl ? textEl.value.trim() : '';
      const ratingVal = ratingEl ? ratingEl.value : '';

      if (!text) {
        alert('Please enter your review text.');
        return;
      }
      if (!ratingVal) {
        alert('Please select a rating.');
        return;
      }

      const rating = Number(ratingVal);
      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        alert('Please select a valid rating between 1 and 5.');
        return;
      }

      const submitBtn = reviewForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      const success = await submitReview(token, placeId, text, rating);
      if (success) {
        // clear form
        if (textEl) textEl.value = '';
        if (ratingEl) ratingEl.value = '';
      }

      if (submitBtn) submitBtn.disabled = false;
    });
  })();
});
