<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Get the request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Log the request for debugging
error_log('Cancel Order Request: ' . $input);
error_log('Auth Header: ' . $authHeader);

// Validate required fields
if (!isset($data['orderId'])) {
    http_response_code(400);
    echo json_encode(['code' => '400', 'msg' => 'Order ID is required']);
    exit();
}

// Prepare the request to the actual API
$ch = curl_init('https://shribombaychowpati.com/AdminPanel/WebApi/cancelOrder.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: ' . $authHeader
]);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Log the response for debugging
error_log('Cancel Order API Response: ' . $response);
error_log('Cancel Order HTTP Code: ' . $httpCode);
error_log('Cancel Order Curl Error: ' . $curlError);

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
    http_response_code(500);
    echo json_encode([
        'code' => '500',
        'msg' => 'Invalid response from server'
    ]);
    exit();
}

// Return the response with the same HTTP code
http_response_code($httpCode);
echo json_encode($responseData);
?> 