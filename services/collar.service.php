<?php

require_once __DIR__ . "/../config/api.php";
require_once __DIR__ . "/../config/auth.php";

/*
|--------------------------------------------------------------------------
| Get All Collar
|--------------------------------------------------------------------------
*/

function getAllCollar()
{
    $token = getToken();

    $response = apiGet(
        "/collars",
        $token
    );

    return $response["data"] ?? [];
}

/*
|--------------------------------------------------------------------------
| Get Collar By ID
|--------------------------------------------------------------------------
*/

function getCollarById($id)
{
    $token = getToken();

    $response = apiGet(
        "/collars/" . $id,
        $token
    );

    return $response["data"] ?? null;
}

/*
|--------------------------------------------------------------------------
| Create Collar
|--------------------------------------------------------------------------
*/

function createCollar($data)
{
    $token = getToken();

    return apiPost(
        "/collars",
        $data,
        $token
    );
}

/*
|--------------------------------------------------------------------------
| Update Collar
|--------------------------------------------------------------------------
*/

function updateCollar($id, $data)
{
    $token = getToken();

    return apiPut(
        "/collars/" . $id,
        $data,
        $token
    );
}

/*
|--------------------------------------------------------------------------
| Delete Collar
|--------------------------------------------------------------------------
*/

function deleteCollar($id)
{
    $token = getToken();

    return apiDelete(
        "/collars/" . $id,
        $token
    );
}

/*
|--------------------------------------------------------------------------
| Handle API Request (GET/POST/PUT/DELETE)
|--------------------------------------------------------------------------
*/

function handleApiRequestCollar($method, $endpoint, $data = null)
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
