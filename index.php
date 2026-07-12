<?php

require_once "config/auth.php";

if(isLoggedIn()){

    header("Location: pages/dashboard.php");

}else{

    header("Location: login.php");

}

exit;