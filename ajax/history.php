<?php

require_once "../config/auth.php";
require_once "../config/api.php";

requireLogin();

header("Content-Type: application/json");

$token = getToken();

$cowId = $_GET["cowId"] ?? "";
$date = $_GET["date"] ?? null; // expected YYYY-MM-DD

if (!$cowId) {
    echo json_encode(["success" => false, "message" => "cowId required"]);
    exit;
}

$year = $month = $day = null;
if ($date) {
    $parts = explode('-', $date);
    if (count($parts) === 3) {
        $year = $parts[0]; $month = $parts[1]; $day = $parts[2];
    }
}

$endpoint = "/monitoring/history/" . $cowId;
if ($year && $month && $day) {
    $endpoint .= "?year={$year}&month={$month}&day={$day}";
}

$result = apiGet($endpoint, $token);

echo json_encode($result);
