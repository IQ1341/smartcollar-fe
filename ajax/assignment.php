<?php

require_once "../config/auth.php";
require_once "../services/assignment.service.php";
require_once "../services/cow.service.php";
require_once "../services/collar.service.php";

requireLogin();

header("Content-Type: application/json");

$action = $_POST["action"] ?? "";

switch ($action) {

    case "list":
        $assignments = getAllAssignment();
        echo json_encode(["success" => true, "data" => $assignments]);
        break;

    case "attach":
        $cowId = $_POST["cowId"] ?? null;
        $collarId = $_POST["collarId"] ?? null;

        if (!$cowId || !$collarId) {
            echo json_encode(["success" => false, "message" => "cowId and collarId are required"]);
            exit;
        }

        $response = attachAssignment(["cowId" => $cowId, "collarId" => $collarId]);
        echo json_encode($response);
        break;

    case "detach":
        $cowId = $_POST["cowId"] ?? null;

        if (!$cowId) {
            echo json_encode(["success" => false, "message" => "cowId is required"]);
            exit;
        }

        $response = detachAssignment(["cowId" => $cowId]);
        echo json_encode($response);
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
        break;
}
