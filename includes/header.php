<?php

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

require_once __DIR__ . "/../config/app.php";
require_once __DIR__ . "/../config/auth.php";

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0">

    <title>Smart Collar Dashboard</title>

    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
        rel="stylesheet">

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet">

    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <link
        rel="stylesheet"
        href="/assets/css/style.css">

    <!-- App Configuration -->
    <script>
        window.APP = {
            apiUrl: "<?= API_URL ?>",

            firebase: {
                apiKey: "<?= FIREBASE_API_KEY ?>",
                authDomain: "<?= FIREBASE_AUTH_DOMAIN ?>",
                databaseURL: "<?= FIREBASE_DATABASE_URL ?>",
                projectId: "<?= FIREBASE_PROJECT_ID ?>",
                storageBucket: "<?= FIREBASE_STORAGE_BUCKET ?>",
                messagingSenderId: "<?= FIREBASE_MESSAGING_SENDER_ID ?>",
                appId: "<?= FIREBASE_APP_ID ?>"
            }
        };

        console.log("APP CONFIG", window.APP);
    </script>

</head>

<body>

<div class="wrapper">

<main>