<?php

session_start();

function isLoggedIn()
{
    return isset($_SESSION["token"]);
}

function getToken()
{
    return $_SESSION["token"] ?? null;
}

function getUid()
{
    return $_SESSION["uid"] ?? null;
}

function requireLogin()
{
    if (!isLoggedIn()) {

        header("Location: /login.php");

        exit;

    }
}