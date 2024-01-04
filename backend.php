<?php
header('Content-Type: application/json');


$bestellungsanzahl = isset($_COOKIE['bestellungsanzahl']) ? (int)$_COOKIE['bestellungsanzahl'] : 0;

$bestellungsanzahl++;
setcookie('bestellungsanzahl', $bestellungsanzahl, time() + 3600 * 24 * 365);
$input = json_decode(file_get_contents('php://input'), true);


function isValidName($name) {
    return preg_match('/^[a-z ,.\'-]+$/i', $name);
}

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}


if ($input) {
    if (empty($input['kleidungsstueck'])) {
        $errors['kleidungsstueck'] = 'Bitte wählen Sie ein Kleidungsstück aus.';
    }

    if (empty($input['webmuster'])) {
        $errors['webmuster'] = 'Bitte wählen Sie ein Webmuster aus.';
    }

    if (empty($input['groesse'])) {
        $errors['groesse'] = 'Bitte wählen Sie eine Grösse aus.';
    }

    if (empty($input['name']) || !isValidName($input['name'])) {
        $errors['name'] = 'Bitte geben Sie einen gültigen Namen ein.';
    }

    if (empty($input['email']) || !isValidEmail($input['email'])) {
        $errors['email'] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    if (empty($errors)) {
    $kleidungsstueck = $input['kleidungsstueck'];
    $groesse = $input['groesse'];
    $name = $input['name'];

    setcookie("letzteGroesse", $groesse, time() + 3600);

    $thankyou = "Vielen Dank für deinen Kauf, $name! Du hast ein $kleidungsstueck in der Grösse $groesse bestellt.";
    
    if ($bestellungsanzahl === 1) {
        $personalisierteNachricht = "Dies ist die erste Bestellung";
    } else {
        $personalisierteNachricht = "Dies ist die $bestellungsanzahl. Bestellung.";
    }

    $nachricht = "$thankyou $personalisierteNachricht";

    $response = [
        'message' => $nachricht,
        'status' => 'success'
    ];
    } else {
        $response = [
            'message' => 'Fehler beim Validieren der Daten.',
            'status' => 'error',
            'errors' => $errors
        ];
    }
} else {
    $response = [
        'message' => 'Fehler beim Empfang der Daten.',
        'status' => 'error'
    ];
}

echo json_encode($response);