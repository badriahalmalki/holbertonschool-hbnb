# HBnB Evolution

An AirBnB-like property rental platform built across four progressive phases as part of the Holberton School curriculum. Each phase builds on the last — from architecture design through a full-stack web application.

## Project Overview

HBnB follows a **three-layer architecture** (Presentation → Business Logic → Persistence) with a **Facade pattern** mediating between layers. The project is structured so that each part can be understood and run independently.

## Phases

| Phase | Directory | Focus | Key Tech |
|-------|-----------|-------|----------|
| 1 | `part1/` | Architecture & technical documentation | UML, Mermaid.js |
| 2 | `part2/` | RESTful API with in-memory storage | Python, Flask, Flask-RESTX |
| 3 | `part3/` | Auth, database persistence & access control | SQLAlchemy, JWT, bcrypt |
| 4 | `part4/` | Frontend web client | HTML5, CSS3, JavaScript ES6 |

## Repository Structure

```
holbertonschool-hbnb/
├── part1/      # Technical documentation, UML class & sequence diagrams
├── part2/      # Flask REST API with in-memory storage, 43 test cases
├── part3/      # Production-ready backend with JWT auth & SQLite/MySQL
└── part4/      # Single-page web client communicating with the Part 3 API
```

## Tech Stack

- **Backend:** Python 3, Flask, Flask-RESTX
- **Database:** SQLAlchemy ORM, SQLite (development), MySQL (production)
- **Authentication:** JWT (Flask-JWT-Extended), bcrypt password hashing
- **Frontend:** HTML5, CSS3, JavaScript ES6 (Fetch API, no frameworks)
- **CORS:** flask-cors

## Getting Started

Each phase has its own dependencies. Navigate into the relevant directory and follow the steps below.

### Part 2

```bash
cd part2
pip install -r requirements.txt
python run.py
```

API available at `http://localhost:5000` — Swagger UI at `http://localhost:5000/api/v1/`.

### Part 3

```bash
cd part3
pip install -r requirements.txt
python run.py
```

### Part 4 (Full stack)

Start the Part 3 backend first, then open `part4/index.html` in a browser, or serve it with:

```bash
cd part4
pip install -r requirements.txt
python run.py
```

## Authors

- Reem Abdulhadi Alshehri
- Badryah Almalki
- Ebtihal Alomari
