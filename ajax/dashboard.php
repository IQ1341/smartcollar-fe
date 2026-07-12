<?php

require_once "../config/auth.php";
require_once "../config/api.php";

requireLogin();

header("Content-Type: application/json");

$token =
    getToken();

$cowId =
    $_GET["cowId"] ?? "";

$data =
    apiGet(
        "/monitoring/latest/" . $cowId,
        $token
    );

echo json_encode($data);