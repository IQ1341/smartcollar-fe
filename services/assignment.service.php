<?php

require_once __DIR__ . "/../config/api.php";
require_once __DIR__ . "/../config/auth.php";

function getAllAssignment()
{
    $token = getToken();

    $response = apiGet(
        "/assignments",
        $token
    );

    return $response["data"] ?? [];
}

function attachAssignment($data)
{
    $token = getToken();

    return apiPost(
        "/assignments/attach",
        $data,
        $token
    );
}

function detachAssignment($data)
{
    $token = getToken();

    return apiPost(
        "/assignments/detach",
        $data,
        $token
    );
}
