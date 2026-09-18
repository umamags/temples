<?php
// POST /backend/edit/uploadTempleMedia.php
// Upload photos, videos, or descriptions for a temple

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

        // Update database
        $updateQuery = "UPDATE temples SET description = ? WHERE id = ?";
        $stmt = $mysqli->prepare($updateQuery);
        $stmt->bind_param('si', $description, $temple_id);
        $stmt->execute();

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
        sendError('File upload error: ' . $file['error'], 'UPLOAD_ERROR', 400);
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
        sendError('Failed to save file', 'FILE_ERROR', 500);
    }

    // Get existing media URLs from database
    $getQuery = "SELECT {$mediaDir}_urls FROM temples WHERE id = ?";
    $stmt = $mysqli->prepare($getQuery);
    $columnName = $mediaDir === 'photos' ? 'photo_urls' : 'video_urls';
    $stmt->bind_param('i', $temple_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    $mediaUrls = $row[$columnName] ? json_decode($row[$columnName], true) : [];
    if (!is_array($mediaUrls)) {
        $mediaUrls = [];
    }

    // Add new URL
    $mediaUrls[] = $webPath;
    $mediaUrlsJson = json_encode($mediaUrls);

    // Update database
    $updateQuery = "UPDATE temples SET {$columnName} = ? WHERE id = ?";
    $stmt = $mysqli->prepare($updateQuery);
    $stmt->bind_param('si', $mediaUrlsJson, $temple_id);
    $stmt->execute();

    sendSuccess([
        'file_path' => $webPath,
        'media_type' => $media_type,
        'message' => ucfirst($media_type) . ' uploaded successfully'
    ]);

} catch (Exception $e) {
    error_log('uploadTempleMedia error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
