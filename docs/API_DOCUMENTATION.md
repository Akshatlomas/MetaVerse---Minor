# IIIT Bhopal Metaverse — REST API Documentation

This document provides complete, production-grade documentation for all REST API endpoints available in the **IIIT Bhopal Metaverse** backend service.

Base URL: `http://localhost:5000/api` (proxied in Vite as `/api`)

---

## Table of Contents
1. [Overview & Standards](#overview--standards)
2. [Health & System Config](#1-health--system-config)
3. [Campus Locations](#2-campus-locations)
4. [Search Engine](#3-search-engine)
5. [A* Navigation & Pathfinding](#4-a-navigation--pathfinding)
6. [AI Campus Assistant](#5-ai-campus-assistant)
7. [Student Favorites & Preferences](#6-student-favorites--preferences)
8. [Error Handling & Status Codes](#error-handling--status-codes)

---

## Overview & Standards

- **Data Exchange Format**: JSON (`application/json`)
- **HTTP Methods**: GET, POST, DELETE, PUT
- **CORS**: Configured for local development (`http://localhost:5173`) and customizable via `CLIENT_ORIGIN`
- **Dual Mode Support**:
  - **Demo Mode**: Automatically activates if MongoDB is offline or `MONGODB_URI` is unset. Serves bundled verified campus data from memory.
  - **Database Mode**: Connects to MongoDB via Mongoose when `MONGODB_URI` is configured.
- **Header Authentication / User Context**:
  - `x-user-id`: Optional student identifier header (default: `demo-student`).

---

## 1. Health & System Config

### 1.1 Health Check
Returns system status, operating mode (`demo` or `database`), uptime, and institute metadata.

- **Endpoint**: `GET /api/health`
- **Query Parameters**: None
- **Sample Request**:
  ```bash
  curl -s http://localhost:5000/api/health
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "institute": "IIIT Bhopal",
    "fullName": "Indian Institute of Information Technology Bhopal",
    "mode": "demo",
    "uptime": 142.85,
    "timestamp": "2026-10-30T00:45:00.000Z"
  }
  ```

### 1.2 Campus World Configuration
Returns world geometry, grid tile dimensions, boundaries, and default spawn coordinates for Phaser 3 rendering.

- **Endpoint**: `GET /api/config`
- **Sample Request**:
  ```bash
  curl -s http://localhost:5000/api/config
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "campusName": "IIIT Bhopal Metaverse",
    "world": {
      "width": 1600,
      "height": 1400,
      "tileSize": 32,
      "cols": 50,
      "rows": 43
    },
    "spawn": {
      "x": 640,
      "y": 1210
    }
  }
  ```

---

## 2. Campus Locations

### 2.1 List All Locations
Retrieves all mapped campus landmarks, optionally filtered by category.

- **Endpoint**: `GET /api/locations`
- **Query Parameters**:
  - `type` (optional): Filter by category (`academic`, `admin`, `research`, `hostel`, `food`, `sports`, `entrance`, `other`)
- **Sample Request**:
  ```bash
  curl -s "http://localhost:5000/api/locations?type=academic"
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "count": 2,
    "mode": "demo",
    "locations": [
      {
        "id": "cse-it-block",
        "name": "Department of Computer Science & IT (CCF)",
        "type": "academic",
        "categoryName": "Academic & Labs",
        "x": 320,
        "y": 700,
        "width": 220,
        "height": 180,
        "description": "Central Computing Facility (CCF) and core academic home for B.Tech CSE and IT students...",
        "services": [
          "AI & Deep Learning Lab",
          "Networks & Security Lab",
          "Software Engineering Lab",
          "Central Server Room"
        ],
        "hours": "8:30 AM - 8:00 PM (Labs accessible 24/7 for project work)",
        "searchable": true,
        "interactive": true,
        "verified": true,
        "keywords": ["cse", "it", "ccf", "coding", "gpu", "ai", "labs", "computers"]
      }
    ]
  }
  ```

### 2.2 Get Location by ID
Retrieves complete details for a single campus building.

- **Endpoint**: `GET /api/locations/:id`
- **Path Parameters**:
  - `id`: Unique location identifier (e.g., `central-library`, `cse-it-block`, `food-court`)
- **Sample Request**:
  ```bash
  curl -s http://localhost:5000/api/locations/central-library
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "mode": "demo",
    "location": {
      "id": "central-library",
      "name": "Dr. APJ Abdul Kalam Central Library",
      "type": "academic",
      "categoryName": "Library & Reading Halls",
      "x": 1260,
      "y": 680,
      "width": 260,
      "height": 190,
      "description": "Comprehensive institutional library featuring air-conditioned reading halls...",
      "services": [
        "15,000+ Textbooks & References",
        "IEEE Xplore Digital Access Terminals",
        "ACM Digital Library Subscription",
        "Quiet Study Section"
      ],
      "hours": "8:00 AM - 10:00 PM (Reading Hall 24/7 during exams)",
      "searchable": true,
      "interactive": true,
      "verified": true
    }
  }
  ```
- **Error Response** (`404 Not Found`):
  ```json
  {
    "error": "Location with id \"unknown-hall\" not found"
  }
  ```

### 2.3 List Location Categories
Returns distinct categories with location counts and icon keys.

- **Endpoint**: `GET /api/locations/categories`
- **Sample Request**:
  ```bash
  curl -s http://localhost:5000/api/locations/categories
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "categories": [
      { "type": "entrance", "name": "Entrance & Security", "count": 1, "icon": "DoorOpen" },
      { "type": "admin", "name": "Administration", "count": 1, "icon": "Building2" },
      { "type": "academic", "name": "Academic & Labs", "count": 3, "icon": "GraduationCap" },
      { "type": "research", "name": "Research & Incubation", "count": 1, "icon": "Cpu" },
      { "type": "hostel", "name": "Student Hostels", "count": 2, "icon": "Home" },
      { "type": "food", "name": "Cafeteria & Dining", "count": 1, "icon": "UtensilsCrossed" },
      { "type": "sports", "name": "Sports & Recreation", "count": 1, "icon": "Trophy" }
    ]
  }
  ```

---

## 3. Search Engine

### 3.1 Live Campus Search
Performs instant multi-field keyword searching across building names, categories, descriptions, services, and keyword arrays.

- **Endpoint**: `GET /api/search`
- **Query Parameters**:
  - `q` (required): Search keyword string (e.g., `library`, `gpu`, `coffee`, `cricket`)
- **Sample Request**:
  ```bash
  curl -s "http://localhost:5000/api/search?q=coding"
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "query": "coding",
    "count": 2,
    "results": [
      {
        "id": "cse-it-block",
        "name": "Department of Computer Science & IT (CCF)",
        "type": "academic"
      },
      {
        "id": "innovation-centre",
        "name": "Innovation & Incubation Centre (IIEC)",
        "type": "research"
      }
    ]
  }
  ```

---

## 4. A* Navigation & Pathfinding

### 4.1 Request Route Between Locations
Calculates walking path between two known campus buildings using grid-based A* pathfinding.

- **Endpoint**: `POST /api/navigation`
- **Request Body**:
  ```json
  {
    "from": "main-gate",
    "to": "central-library"
  }
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "from": "main-gate",
    "fromName": "Main Campus Entrance Gate",
    "to": "central-library",
    "toName": "Dr. APJ Abdul Kalam Central Library",
    "found": true,
    "distanceM": 834,
    "etaSeconds": 642,
    "path": [
      { "x": 640, "y": 1216 },
      { "x": 640, "y": 816 },
      { "x": 1136, "y": 816 },
      { "x": 1264, "y": 688 }
    ],
    "note": "A* computed route avoiding solid obstacles on campus grid."
  }
  ```

### 4.2 Compute Dynamic Coordinate Route
Calculates an A* route from dynamic coordinates (such as the avatar's live position) to a destination building.

- **Endpoint**: `POST /api/navigation/route`
- **Request Body**:
  ```json
  {
    "fromX": 640,
    "fromY": 1210,
    "toId": "food-court"
  }
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "success": true,
    "found": true,
    "destination": "Campus Cafeteria & Food Court",
    "distanceM": 412,
    "etaSeconds": 317,
    "path": [
      { "x": 640, "y": 1210 },
      { "x": 640, "y": 1024 },
      { "x": 960, "y": 1024 }
    ]
  }
  ```

---

## 5. AI Campus Assistant

### 5.1 Send Natural Language Inquiry
Translates natural student queries into intelligent campus guidance and structured map actions (`navigate`, `show_location`, `search`). Operates in zero-cost offline fallback mode or connects to upstream LLM when configured.

- **Endpoint**: `POST /api/assistant`
- **Request Body**:
  ```json
  {
    "message": "Where can I get coffee or snacks between lectures?"
  }
  ```
- **Sample Response** (`200 OK`):
  ```json
  {
    "reply": "You can grab meals and refreshments at the Campus Cafeteria & Food Court! It features the main student canteen, juice counter, and a Nescafe kiosk. Open 8:00 AM - 10:30 PM.",
    "action": {
      "action": "show_location",
      "location": "food-court"
    },
    "provider": "mock"
  }
  ```

- **Sample Navigation Action Response**:
  - Request: `{"message": "Take me to the library"}`
  - Response:
    ```json
    {
      "reply": "Plotting A* navigation route to Dr. APJ Abdul Kalam Central Library. Follow the illuminated golden pathway on campus!",
      "action": {
        "action": "navigate",
        "destination": "central-library"
      },
      "provider": "mock"
    }
    ```

---

## 6. Student Favorites & Preferences

### 6.1 List Saved Locations
- **Endpoint**: `GET /api/favorites`
- **Headers**: `x-user-id: demo-student` (optional)
- **Sample Response** (`200 OK`):
  ```json
  {
    "mode": "demo",
    "favorites": [
      {
        "id": "central-library",
        "name": "Dr. APJ Abdul Kalam Central Library",
        "type": "academic"
      },
      {
        "id": "food-court",
        "name": "Campus Cafeteria & Food Court",
        "type": "food"
      }
    ]
  }
  ```

### 6.2 Add Saved Location
- **Endpoint**: `POST /api/favorites`
- **Request Body**:
  ```json
  {
    "locationId": "cse-it-block"
  }
  ```
- **Sample Response** (`201 Created`):
  ```json
  {
    "message": "Saved to favorites (Demo Mode)",
    "location": {
      "id": "cse-it-block",
      "name": "Department of Computer Science & IT (CCF)"
    },
    "mode": "demo"
  }
  ```

### 6.3 Remove Saved Location
- **Endpoint**: `DELETE /api/favorites/:id`
- **Sample Response** (`200 OK`):
  ```json
  {
    "message": "Removed from favorites (Demo Mode)",
    "locationId": "cse-it-block",
    "mode": "demo"
  }
  ```

---

## Error Handling & Status Codes

All errors return a predictable JSON payload:
```json
{
  "error": "Descriptive message identifying the validation or processing issue"
}
```

| HTTP Code | Description | Typical Cause |
|-----------|-------------|---------------|
| `200 OK` | Request succeeded | Standard successful GET / POST |
| `201 Created` | Resource created | Favorite added or record created |
| `400 Bad Request` | Invalid input | Missing required body fields (e.g. missing `from`/`to`) |
| `404 Not Found` | Resource not found | Invalid location ID |
| `429 Too Many Requests` | Rate limit triggered | Exceeded assistant call threshold |
| `500 Server Error` | Unexpected exception | Handled cleanly by centralized Express error middleware |
