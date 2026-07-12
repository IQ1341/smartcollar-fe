<?php

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

require_once __DIR__ . "/../config/app.php";

/*
|--------------------------------------------------------------------------
| API Request
|--------------------------------------------------------------------------
*/

function apiRequest(
    $method,
    $endpoint,
    $data = null,
    $token = null
) {

    $url = API_URL . $endpoint;

    $curl = curl_init($url);

    $headers = [
        "Content-Type: application/json"
    ];

    if ($token) {
        $headers[] = "Authorization: Bearer {$token}";
    }

    curl_setopt_array(
        $curl,
        [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => strtoupper($method),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CONNECTTIMEOUT => API_CONNECT_TIMEOUT,
            CURLOPT_TIMEOUT => API_TIMEOUT,
        ]
    );

    if ($data !== null) {

        curl_setopt(
            $curl,
            CURLOPT_POSTFIELDS,
            json_encode($data)
        );

    }

    $response = curl_exec($curl);

    /*
    |--------------------------------------------------------------------------
    | CURL Error
    |--------------------------------------------------------------------------
    */

    if (curl_errno($curl)) {

        $message = curl_error($curl);

        curl_close($curl);

        return [
            "success" => false,
            "status" => 500,
            "message" => $message
        ];

    }

    /*
    |--------------------------------------------------------------------------
    | HTTP Status
    |--------------------------------------------------------------------------
    */

    $status = curl_getinfo(
        $curl,
        CURLINFO_HTTP_CODE
    );

    curl_close($curl);

    /*
    |--------------------------------------------------------------------------
    | Decode JSON
    |--------------------------------------------------------------------------
    */

    $result = json_decode(
        $response,
        true
    );

    if (json_last_error() !== JSON_ERROR_NONE) {

        return [
            "success" => false,
            "status" => $status,
            "message" => "Invalid JSON response",
            "raw" => $response
        ];

    }

    $result["status"] = $status;

    return $result;

}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

function apiGet(
    $endpoint,
    $token = null
) {

    return apiRequest(
        "GET",
        $endpoint,
        null,
        $token
    );

}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

function apiPost(
    $endpoint,
    $data,
    $token = null
) {

    return apiRequest(
        "POST",
        $endpoint,
        $data,
        $token
    );

}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

function apiPut(
    $endpoint,
    $data,
    $token = null
) {

    return apiRequest(
        "PUT",
        $endpoint,
        $data,
        $token
    );

}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

function apiDelete(
    $endpoint,
    $token = null
) {

    return apiRequest(
        "DELETE",
        $endpoint,
        null,
        $token
    );

}