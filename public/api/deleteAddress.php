<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Log all headers for debugging
error_log('All Headers: ' . print_r($headers, true));

// Get the request body
$input = file_get_contents('php://input');
error_log('Raw Input: ' . $input);

$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('JSON Decode Error: ' . json_last_error_msg());
    http_response_code(400);
    echo json_encode(['code' => '400', 'msg' => 'Invalid JSON data']);
    exit();
}

// Log the request for debugging
error_log('Delete Address Request Data: ' . print_r($data, true));
error_log('Auth Header: ' . $authHeader);

// Validate required fields
if (!isset($data['addressId'])) {
    http_response_code(400);
    echo json_encode(['code' => '400', 'msg' => 'Address ID is required']);
    exit();
}

// Prepare the request to the actual API
$apiUrl = 'https://shribombaychowpati.com/AdminPanel/WebApi/deleteAddress.php';
$postData = [
    'addressId' => $data['addressId']
];

error_log('API URL: ' . $apiUrl);
error_log('Post Data: ' . print_r($postData, true));

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: ' . $authHeader,
    'Content-Type: application/x-www-form-urlencoded'
]);

// Enable verbose output for debugging
curl_setopt($ch, CURLOPT_VERBOSE, true);
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

// Log verbose output
rewind($verbose);
$verboseLog = stream_get_contents($verbose);
error_log('Curl Verbose Log: ' . $verboseLog);
fclose($verbose);

curl_close($ch);

// Log the response for debugging
error_log('Delete Address API Response: ' . $response);
error_log('Delete Address HTTP Code: ' . $httpCode);
error_log('Delete Address Curl Error: ' . $curlError);

// Check for curl errors
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'code' => '500',
        'msg' => 'Failed to connect to the server: ' . $curlError
    ]);
    exit();
}

// Check if we got a valid response
if ($response === false) {
    http_response_code(500);
    echo json_encode([
        'code' => '500',
        'msg' => 'No response from server'
    ]);
    exit();
}

// Try to decode the response
$responseData = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('Response JSON Decode Error: ' . json_last_error_msg());
    error_log('Raw Response: ' . $response);
    http_response_code(500);
    echo json_encode([
        'code' => '500',
        'msg' => 'Invalid response from server: ' . json_last_error_msg()
    ]);
    exit();
}

// Return the response with the same HTTP code
http_response_code($httpCode);
echo json_encode($responseData);
?> 