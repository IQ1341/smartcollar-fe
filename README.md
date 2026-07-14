# 🐄 Smart Collar Web

Smart Collar Web adalah aplikasi berbasis **PHP Native** yang digunakan untuk memonitor sapi secara realtime menggunakan perangkat IoT Smart Collar.

Project ini terhubung dengan **Smart Collar Backend (Express.js)** melalui REST API dan menggunakan Firebase Authentication serta Firebase Realtime Database.

---

## Features

- Firebase Authentication
- Dashboard Monitoring
- Cow Management
- Smart Collar Management
- Assignment Management
- Realtime Monitoring
- Google Maps
- Monitoring History
- WhatsApp Notification (Planned)

---

## Tech Stack

### Frontend

- PHP Native
- Bootstrap 5
- JavaScript
- Fetch API

### Backend

- Node.js
- Express.js

### Database

- Firebase Realtime Database

### Authentication

- Firebase Authentication

---

## Project Structure

```
smartcollar-web/

├── ajax/
├── assets/
│   ├── css/
│   ├── img/
│   └── js/
│
├── config/
├── includes/
├── pages/
├── services/
│
├── index.php
├── login.php
├── README.md
├── LICENSE
├── CHANGELOG.md
└── .gitignore
```

---

## Installation

Clone repository

```bash
git clone https://github.com/yourusername/smartcollar-web.git
```

Masuk ke project

```bash
cd smartcollar-web
```

Install dependency

```bash
composer install
```

---

## Configuration

Edit

```
config/api.php
```

```php
define(
    "API_URL",
    "http://localhost:3000/api/v1"
);
```

---

## Run

PHP Built-in Server

```bash
php -S localhost:8080
```

atau menggunakan XAMPP

```
http://localhost/smartcollar-web
```

---

## Monitoring Flow

```
ESP32
   │
   ▼
REST API
   │
   ▼
Express Backend
   │
   ▼
Firebase
   │
   ▼
PHP Dashboard
```

---

## Development Status

| Module | Status |
|----------|--------|
| Authentication | ✅ |
| Dashboard | ✅ |
| Cow Management | ✅ |
| Smart Collar | ✅ |
| Assignment | ✅ |
| Monitoring | ✅|
| History | ✅ |
| WhatsApp Notification | ✅ |

---

## License

MIT License

---

## Author

Muhammad Iqbal

Software Engineer

DevGo
