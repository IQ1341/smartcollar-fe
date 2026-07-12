<?php

require_once __DIR__ . "/../config/api.php";
require_once __DIR__ . "/../config/auth.php";

/*
|--------------------------------------------------------------------------
| Dashboard Summary
|--------------------------------------------------------------------------
*/

function dashboardSummary()
{
    $token = getToken();

    /*
    |--------------------------------------------------------------------------
    | Get Cow
    |--------------------------------------------------------------------------
    */

    $cowResponse =
        apiGet(
            "/cows",
            $token
        );

    $cows =
        $cowResponse["data"] ?? [];

    /*
    |--------------------------------------------------------------------------
    | Get Smart Collar
    |--------------------------------------------------------------------------
    */

    $collarResponse =
        apiGet(
            "/collars",
            $token
        );

    $collars =
        $collarResponse["data"] ?? [];

    /*
    |--------------------------------------------------------------------------
    | Get Assignment
    |--------------------------------------------------------------------------
    */

    $assignmentResponse =
        apiGet(
            "/assignments",
            $token
        );

    $assignments =
        $assignmentResponse["data"] ?? [];

    /*
    |--------------------------------------------------------------------------
    | Online Device
    |--------------------------------------------------------------------------
    */

    $online = 0;
    $offline = 0;
    $available = 0;

    foreach ($collars as $collar) {

        $assigned = isset($collar["assigned"]) ? $collar["assigned"] : false;
        if (!$assigned) {
            $available++;
        }

        if (isset($collar["lastOnline"])) {
            $diff = time() * 1000 - $collar["lastOnline"];
            if ($diff < 30000) {
                $online++;
            } else {
                $offline++;
            }
        } else {
            $offline++;
        }

    }

    /*
    |--------------------------------------------------------------------------
    | Assigned Cows
    |--------------------------------------------------------------------------
    */

    $activeAssignments = array_filter(
        $assignments,
        function ($assignment) {
            return isset($assignment["active"]) && $assignment["active"];
        }
    );

    $assignedCowIds = array_unique(
        array_filter(
            array_map(
                function ($assignment) {
                    return $assignment["cowId"] ?? null;
                },
                $activeAssignments
            )
        )
    );

    $cows = array_map(
        function ($cow) use ($assignedCowIds) {
            $cow["assigned"] = in_array($cow["id"], $assignedCowIds, true);
            return $cow;
        },
        $cows
    );

    return [

        "cow" =>
            count($cows),

        "collar" =>
            count($collars),

        "assignment" =>
            count($activeAssignments),

        "available" =>
            $available,

        "online" =>
            $online,

        "offline" =>
            $offline,

        "cows" =>
            $cows

    ];

}