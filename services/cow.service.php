<?php

require_once __DIR__ . "/../config/api.php";
require_once __DIR__ . "/../config/auth.php";

/*
|--------------------------------------------------------------------------
| Get All Cow
|--------------------------------------------------------------------------
*/

function getAllCow()
{
    $token = getToken();

    $response = apiGet(
        "/cows",
        $token
    );

    return $response["data"] ?? [];
}

/*
|--------------------------------------------------------------------------
| Get Cow By ID
|--------------------------------------------------------------------------
*/

function getCowById($id)
{
    $token = getToken();

    $response = apiGet(
        "/cows/" . $id,
        $token
    );

    return $response["data"] ?? null;
}

/*
|--------------------------------------------------------------------------
| Create Cow
|--------------------------------------------------------------------------
*/

function createCow($data)
{
    $token = getToken();

    return apiPost(
        "/cows",
        $data,
        $token
    );
}

/*
|--------------------------------------------------------------------------
| Update Cow
|--------------------------------------------------------------------------
*/

function updateCow($id, $data)
{
    $token = getToken();

    return apiPut(
        "/cows/" . $id,
        $data,
        $token
    );
}

/*
|--------------------------------------------------------------------------
| Delete Cow
|--------------------------------------------------------------------------
*/

function deleteCow($id)
{
    $token = getToken();

    return apiDelete(
        "/cows/" . $id,
        $token
    );
}

/*
|--------------------------------------------------------------------------
| Handle API Request (GET/POST/PUT/DELETE)
|--------------------------------------------------------------------------
*/

function handleApiRequest($method, $endpoint, $data = null)
{
    $token = getToken();
    
    $response = apiRequest(
        $method,
        $endpoint,
        $data,
        $token
    );
    
    return $response;
}