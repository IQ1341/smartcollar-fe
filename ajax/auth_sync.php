<?php

require_once "../config/auth.php";
require_once "../config/api.php";

requireLogin();

header("Content-Type: application/json");

$token = getToken();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "Invalid request payload"]);
    exit;
}

$name = trim($input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$address = trim($input['address'] ?? '');
$photoUrl = trim($input['photoUrl'] ?? '');

if (!$name || !$phone || !$address) {
    echo json_encode(["success" => false, "message" => "Semua field user wajib diisi"]);
    exit;
}

$data = [
    "name" => $name,
    "phone" => $phone,
    "address" => $address,
    "photoUrl" => $photoUrl,
];

$result = apiPost("/auth/sync", $data, $token);

echo json_encode($result);
