<?php
// GET /backend/multimedia/getMultimedia.php?temple_id=2212
// Returns all image files for a specific temple from the file system

// Set CORS headers
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'])) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Get temple_id from query parameter
    $templeId = isset($_GET['temple_id']) ? intval($_GET['temple_id']) : null;

    if (!$templeId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'temple_id parameter is required',
            'code' => 'MISSING_PARAM'
        ]);
        exit;
    }

    // Determine environment and build photo directory path
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
    $serverName = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '';
    $hostToCheck = $origin . $host . $serverName;
    $environment = strpos($hostToCheck, 'ai-lab.in') !== false ? 'prod' : 'local';

    // Build photo directory path
    if ($environment === 'prod') {
        $photoDir = __DIR__ . '/../../data/temples/photos/temple_' . $templeId;
    } else {
        // Local: relative path from this file
        $photoDir = __DIR__ . '/../../data/temples/photos/temple_' . $templeId;
    }

    error_log("Scanning directory for temple $templeId: $photoDir");

    // Check if directory exists
    if (!is_dir($photoDir)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'temple_id' => $templeId,
            'images' => [],
            'count' => 0,
            'message' => 'No photos directory found for this temple'
        ]);
        exit;
    }

    // Supported image extensions
    $supportedExts = ['jpg', 'jpeg', 'png', 'webp', 'heic'];

    // Scan directory for image files
    $files = scandir($photoDir);
    $images = [];

    foreach ($files as $file) {
        // Skip . and ..
        if ($file === '.' || $file === '..') {
            continue;
        }

        $filePath = $photoDir . '/' . $file;

        // Skip if not a file
        if (!is_file($filePath)) {
            continue;
        }

        // Check if file extension is supported
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (!in_array($ext, $supportedExts)) {
            continue;
        }

        // Build full URL based on environment
        if ($environment === 'prod') {
            // Production: use domain name
            $baseUrl = 'https://ai-lab.in';
            $webPath = $baseUrl . "/data/temples/photos/temple_$templeId/$file";
        } else {
            // Local: use localhost with PHP server port
            $scheme = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
            $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost:8000';
            $baseUrl = $scheme . '://' . $host;
            $webPath = $baseUrl . "/data/temples/photos/temple_$templeId/$file";
        }

        $images[] = [
            'filename' => $file,
            'path' => $webPath,
            'size' => filesize($filePath),
            'modified' => filemtime($filePath)
        ];
    }

    // Sort by modification time (newest first)
    usort($images, function($a, $b) {
        return $b['modified'] - $a['modified'];
    });

    error_log("Found " . count($images) . " images for temple $templeId");

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'temple_id' => $templeId,
        'images' => $images,
        'count' => count($images)
    ]);

} catch (Exception $e) {
    error_log('getMultimedia error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage(),
        'code' => 'SERVER_ERROR'
    ]);
}
?>
