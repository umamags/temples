<?php
// POST /backend/edit/uploadTempleMedia.php
// Upload photos, videos, or descriptions for a temple

// Set CORS headers first
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'])) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle OPTIONS preflight
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../query/db.php';

try {
    if (!isset($_POST['temple_id']) || !isset($_POST['media_type'])) {
        sendError('temple_id and media_type are required', 'MISSING_PARAM', 400);
    }

    $temple_id = intval($_POST['temple_id']);
    $media_type = trim($_POST['media_type']); // 'photo', 'video', 'description'

    // Validate media_type
    if (!in_array($media_type, ['photo', 'video', 'description'])) {
        sendError("Invalid media_type. Must be 'photo', 'video', or 'description'", 'INVALID_PARAM', 400);
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Verify temple exists
    $templeQuery = "SELECT id FROM temples WHERE id = ?";
    $stmt = $mysqli->prepare($templeQuery);
    $stmt->bind_param('i', $temple_id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        sendError('Temple not found', 'TEMPLE_NOT_FOUND', 404);
    }

    // Handle text description
    if ($media_type === 'description') {
        if (!isset($_POST['description']) || $_POST['description'] === '') {
            sendError('description text is required', 'MISSING_FIELD', 400);
        }

        $description = $_POST['description'];

        // Create directory if needed
        $dataDir = __DIR__ . '/../../public_html/data/temples/descriptions';
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0755, true);
        }

        // Save description file
        $filePath = "$dataDir/temple_$temple_id.txt";
        if (!file_put_contents($filePath, $description)) {
            sendError('Failed to save description file', 'FILE_ERROR', 500);
        }

        sendSuccess([
            'file_path' => "/data/temples/descriptions/temple_$temple_id.txt",
            'media_type' => 'description',
            'message' => 'Description uploaded successfully'
        ]);
        return;
    }

    // Handle file uploads (photo/video)
    if (!isset($_FILES['file'])) {
        sendError('No file provided', 'NO_FILE', 400);
    }

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE => 'File size exceeds upload_max_filesize (' . ini_get('upload_max_filesize') . ')',
            UPLOAD_ERR_FORM_SIZE => 'File size exceeds form MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder on server',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];

        $errorMsg = isset($errorMessages[$file['error']])
            ? $errorMessages[$file['error']]
            : 'Unknown upload error (' . $file['error'] . ')';

        error_log("Upload error for temple_id=$temple_id: " . $errorMsg . ", file name: " . $file['name']);
        sendError($errorMsg, 'UPLOAD_ERROR', 400);
    }

    // Determine directory based on media_type
    $mediaDir = $media_type === 'photo' ? 'photos' : 'videos';
    $uploadDir = __DIR__ . "/../../public_html/data/temples/$mediaDir/temple_$temple_id";

    // Create directory if needed
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate safe filename
    $originalName = basename($file['name']);
    $ext = pathinfo($originalName, PATHINFO_EXTENSION);
    $filename = time() . '_' . uniqid() . '.' . $ext;
    $filePath = "$uploadDir/$filename";
    $webPath = "/data/temples/$mediaDir/temple_$temple_id/$filename";

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        $error = "Failed to move uploaded file for temple_id=$temple_id from {$file['tmp_name']} to $filePath";
        error_log($error);
        sendError('Failed to save file to server. Check server permissions.', 'FILE_ERROR', 500);
    }

    error_log("Successfully uploaded $media_type for temple_id=$temple_id: $filePath (size: {$file['size']} bytes)");

    sendSuccess([
        'file_path' => $webPath,
        'media_type' => $media_type,
        'message' => ucfirst($media_type) . ' uploaded successfully. Media URL: ' . $webPath
    ]);

} catch (Exception $e) {
    error_log('uploadTempleMedia error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
