# HBnB – Part 4: Simple Web Client

## 📌 Project Overview

Part 4 of the **HBnB project** introduces the front-end layer of the application. Using HTML5, CSS3, and vanilla JavaScript (ES6), this phase builds an interactive web client that connects to the back-end API developed in Part 3.

The client allows users to browse available places, view detailed information, and submit reviews — all without page reloads, using the Fetch API to communicate with the back-end.

---

## 🎯 Features

- **Login** – Authenticate with email and password; JWT token stored in a browser cookie.
- **Places List** – Browse all available places fetched live from the API.
- **Client-side Filtering** – Filter places by maximum price without reloading the page.
- **Place Details** – View full information about a place including host, price, description, amenities, and reviews.
- **Add Review** – Authenticated users can submit a star-rated review directly from the place detail page or a dedicated review form.
- **Auth-aware UI** – Login link shown/hidden based on authentication state; review forms hidden from unauthenticated users.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 |
| Scripting | JavaScript ES6 |
| HTTP Client | Fetch API |
| Session | JWT stored in browser cookies |
| Back-end | Flask API (Part 3) at `http://127.0.0.1:5000` |

---

## 🏗 Project Structure

```
part4/
├── index.html          # Main page – lists all available places
├── login.html          # Login form
├── place.html          # Place detail view with reviews and inline review form
├── add_review.html     # Standalone add-review form (auth-gated)
├── styles.css          # Global styles
├── scripts.js          # All client-side logic (single file)
└── images/
    ├── logo.png        # HBnB logo
    ├── icon.png        # Favicon
    ├── icon_bath.png   # Amenity icon
    ├── icon_bed.png    # Amenity icon
    └── icon_wifi.png   # Amenity icon
```

---

## 📄 Pages

### `index.html` – List of Places
Displays all places as cards fetched from the API. Each card shows the place name, price per night, and a "View Details" link. A price dropdown lets users filter results client-side. The login link is shown only when the user is not authenticated.

### `login.html` – Login
A form with email and password fields. On successful login, the JWT token is stored in a cookie and the user is redirected to `index.html`.

### `place.html` – Place Details
Shows full place information (host, price, description, amenities) and a list of reviews. Authenticated users also see an inline review form at the bottom of the page. The place ID is read from the URL query string (`?id=<place-id>`).

### `add_review.html` – Add Review
A standalone page for submitting a review for a specific place. Unauthenticated users are immediately redirected to `index.html`. The place name is fetched and displayed above the form. The place ID is read from the URL query string.

---

## 🚀 Getting Started

### Prerequisites

The Part 3 back-end must be running before using the web client:

```bash
cd ../part3
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 run.py
```

The API will be available at `http://127.0.0.1:5000`.

### CORS Configuration

When the frontend is served from a different origin than the API, the browser blocks requests due to **CORS** (Cross-Origin Resource Sharing). Add `flask-cors` to the back-end to allow this:

```bash
pip install flask-cors
```

Then in `part3/app/__init__.py`:

```python
from flask_cors import CORS
CORS(app)
```

### Serving the Frontend

Serve the `part4/` directory with any static file server. The simplest option:

```bash
cd part4
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

---

## 🔐 Authentication

Login sends a `POST` request to `/api/v1/auth/login` with `email` and `password`. On success, the returned `access_token` is saved as a browser cookie:

```javascript
document.cookie = `token=${data.access_token}; path=/`;
```

All subsequent API requests that require authentication read this cookie and pass the token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔗 API Endpoints Consumed

| Action | Method | Endpoint |
|---|---|---|
| Login | `POST` | `/api/v1/auth/login` |
| List all places | `GET` | `/api/v1/places/` |
| Get place details | `GET` | `/api/v1/places/:id` |
| Submit a review | `POST` | `/api/v1/reviews/` |

Review submission body:
```json
{
  "text": "Great place!",
  "rating": 5,
  "place_id": "<place-uuid>"
}
```

---

## 🔢 Client-Side Price Filter

The index page populates a dropdown with the following options at runtime:

| Option | Behavior |
|---|---|
| `$10` | Show places with price ≤ $10 |
| `$50` | Show places with price ≤ $50 |
| `$100` | Show places with price ≤ $100 |
| `All` | Show all places |

Filtering happens in memory without re-fetching from the API.

---

## 👩‍💻 Authors

- Reem Abdulhadi Alshehri
- Badriah Barakat Almalki
- Ebtihal Alomari
