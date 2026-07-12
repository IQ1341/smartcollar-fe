<?php

session_start();

$data =
    json_decode(
        file_get_contents("php://input"),
        true
    );

$_SESSION["token"] =
    $data["token"];

$_SESSION["uid"] =
    $data["uid"];

$_SESSION["email"] =
    $data["email"];

echo json_encode([
    "success" => true
]);