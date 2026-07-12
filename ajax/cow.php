<?php

require_once "../config/auth.php";
require_once "../services/cow.service.php";

requireLogin();

header("Content-Type: application/json");

/*
|--------------------------------------------------------------------------
| Action
|--------------------------------------------------------------------------
*/

$action = $_POST["action"] ?? "";

/*
|--------------------------------------------------------------------------
| Switch Action
|--------------------------------------------------------------------------
*/

switch ($action) {

    /*
    |--------------------------------------------------------------------------
    | Get Cow By ID
    |--------------------------------------------------------------------------
    */

    case "get":

        $id = $_POST["id"] ?? null;

        if (!$id) {

            echo json_encode([
                "success" => false,
                "message" => "Cow ID is required"
            ]);

            exit;
        }

        $cow = getCowById($id);

        // Map backend field names to frontend expectations
        if (is_array($cow)) {
            $cow["description"] = $cow["note"] ?? "";
        }

        echo json_encode([
            "success" => true,
            "data" => $cow
        ]);

        break;

    /*
    |--------------------------------------------------------------------------
    | Create Cow
    |--------------------------------------------------------------------------
    */

    case "create":

        // Map frontend fields to backend API schema
        $gender = strtolower(trim($_POST["gender"] ?? ""));

        $weight = (float) ($_POST["weight"] ?? 0);
        if ($weight <= 0) {
            $weight = 1; // default to 1 to satisfy positive validation
        }

        $data = [
            "code" => trim($_POST["code"] ?? ""),
            "name" => trim($_POST["name"] ?? ""),
            "breed" => trim($_POST["breed"] ?? ""),
            "gender" => $gender,
            "birthDate" => trim($_POST["birthDate"] ?? ""),
            "weight" => $weight,
            "note" => trim($_POST["description"] ?? ""),
            "color" => trim($_POST["color"] ?? ""),
            "photoUrl" => trim($_POST["photoUrl"] ?? ""),
            "status" => trim($_POST["status"] ?? "healthy")
        ];

        $response = createCow($data);

        echo json_encode($response);

        break;

    /*
    |--------------------------------------------------------------------------
    | Update Cow
    |--------------------------------------------------------------------------
    */

    case "update":

        $id = $_POST["id"] ?? null;

        if (!$id) {

            echo json_encode([
                "success" => false,
                "message" => "Cow ID is required"
            ]);

            exit;
        }

        $gender = strtolower(trim($_POST["gender"] ?? ""));

        $weight = (float) ($_POST["weight"] ?? 0);
        if ($weight <= 0) {
            $weight = 1;
        }

        $data = [
            "code" => trim($_POST["code"] ?? ""),
            "name" => trim($_POST["name"] ?? ""),
            "breed" => trim($_POST["breed"] ?? ""),
            "gender" => $gender,
            "birthDate" => trim($_POST["birthDate"] ?? ""),
            "weight" => $weight,
            "note" => trim($_POST["description"] ?? ""),
            "color" => trim($_POST["color"] ?? ""),
            "photoUrl" => trim($_POST["photoUrl"] ?? ""),
            "status" => trim($_POST["status"] ?? "healthy")
        ];

        $response = updateCow(
            $id,
            $data
        );

        echo json_encode($response);

        break;

    /*
    |--------------------------------------------------------------------------
    | Delete Cow
    |--------------------------------------------------------------------------
    */

    case "delete":

        $id = $_POST["id"] ?? null;

        if (!$id) {

            echo json_encode([
                "success" => false,
                "message" => "Cow ID is required"
            ]);

            exit;
        }

        $response = deleteCow($id);

        echo json_encode($response);

        break;

    /*
    |--------------------------------------------------------------------------
    | Default
    |--------------------------------------------------------------------------
    */

    default:

        echo json_encode([

            "success" => false,

            "message" => "Invalid action"

        ]);

        break;
}