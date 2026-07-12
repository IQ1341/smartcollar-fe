<?php

require_once "../config/auth.php";
require_once "../services/collar.service.php";

requireLogin();

header("Content-Type: application/json");

$action = $_POST["action"] ?? "";

switch ($action) {

    case "get":

        $id = $_POST["id"] ?? null;

        if (!$id) {

            echo json_encode([
                "success" => false,
                "message" => "Collar ID is required"
            ]);

            exit;
        }

        $collar = getCollarById($id);

        echo json_encode([
            "success" => true,
            "data" => $collar
        ]);

        break;

    case "create":

        $data = [
            "serialNumber" => trim($_POST["serialNumber"] ?? ""),
            "deviceName" => trim($_POST["deviceName"] ?? ""),
            "hardwareVersion" => trim($_POST["hardwareVersion"] ?? ""),
            "firmwareVersion" => trim($_POST["firmwareVersion"] ?? ""),
            "macAddress" => trim($_POST["macAddress"] ?? ""),
            "simNumber" => trim($_POST["simNumber"] ?? "")
        ];

        $response = createCollar($data);

        echo json_encode($response);

        break;

    case "update":

        $id = $_POST["id"] ?? null;

        if (!$id) {

            echo json_encode([
                "success" => false,
                "message" => "Collar ID is required"
            ]);

            exit;
        }

        $data = [
            "serialNumber" => trim($_POST["serialNumber"] ?? ""),
            "deviceName" => trim($_POST["deviceName"] ?? ""),
            "hardwareVersion" => trim($_POST["hardwareVersion"] ?? ""),
            "firmwareVersion" => trim($_POST["firmwareVersion"] ?? ""),
            "macAddress" => trim($_POST["macAddress"] ?? ""),
            "simNumber" => trim($_POST["simNumber"] ?? "")
        ];

        $response = updateCollar($id, $data);

        echo json_encode($response);

        break;

    case "delete":

        $id = $_POST["id"] ?? null;

        if (!$id) {

            echo json_encode([
                "success" => false,
                "message" => "Collar ID is required"
            ]);

            exit;
        }

        $response = deleteCollar($id);

        echo json_encode($response);

        break;

    default:

        echo json_encode([
            "success" => false,
            "message" => "Invalid action"
        ]);

        break;
}
