<?php

/*
|--------------------------------------------------------------------------
| Application Configuration
|--------------------------------------------------------------------------
*/

require_once __DIR__ . "/../vendor/autoload.php";

$dotenv = Dotenv\Dotenv::createImmutable(
    dirname(__DIR__)
);

$dotenv->safeLoad();

/*
|--------------------------------------------------------------------------
| Application Environment
|--------------------------------------------------------------------------
*/

define(
    "APP_NAME",
    $_ENV["APP_NAME"] ?? "Smart Collar"
);

define(
    "APP_ENV",
    $_ENV["APP_ENV"] ?? "local"
);

/*
|--------------------------------------------------------------------------
| API Configuration
|--------------------------------------------------------------------------
*/

define(
    "API_URL",
    $_ENV["API_URL"] ?? "http://localhost:3000/api/v1"
);

define(
    "API_TIMEOUT",
    (int) ($_ENV["API_TIMEOUT"] ?? 10)
);

define(
    "API_CONNECT_TIMEOUT",
    (int) ($_ENV["API_CONNECT_TIMEOUT"] ?? 5)
);

define(
    "FIREBASE_API_KEY",
    $_ENV["FIREBASE_API_KEY"]
);

define(
    "FIREBASE_AUTH_DOMAIN",
    $_ENV["FIREBASE_AUTH_DOMAIN"]
);

define(
    "FIREBASE_DATABASE_URL",
    $_ENV["FIREBASE_DATABASE_URL"]
);

define(
    "FIREBASE_PROJECT_ID",
    $_ENV["FIREBASE_PROJECT_ID"]
);

define(
    "FIREBASE_STORAGE_BUCKET",
    $_ENV["FIREBASE_STORAGE_BUCKET"]
);

define(
    "FIREBASE_MESSAGING_SENDER_ID",
    $_ENV["FIREBASE_MESSAGING_SENDER_ID"]
);

define(
    "FIREBASE_APP_ID",
    $_ENV["FIREBASE_APP_ID"]
);