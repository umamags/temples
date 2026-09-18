<?php
// POST /backend/edit/addTemple.php
// Add a new temple to the database

require_once __DIR__ . '/../query/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        sendError('No data provided', 'INVALID_REQUEST', 400);
    }

    // Validate required fields
    $required = ['name', 'location_id'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            sendError("Missing required field: $field", 'MISSING_FIELD', 400);
        }
    }

    $name = trim($data['name']);
    $location_id = intval($data['location_id']);
    $deity = isset($data['deity']) ? trim($data['deity']) : null;
    $year_constructed = isset($data['year_constructed']) ? intval($data['year_constructed']) : null;
    $location_note = isset($data['location_note']) ? trim($data['location_note']) : null;
    $website = isset($data['website']) ? trim($data['website']) : null;
    $image_url = isset($data['image_url']) ? trim($data['image_url']) : null;
    $source = isset($data['source']) ? trim($data['source']) : 'manual';

    // Handle festivals_and_events as JSON
    $festivals = isset($data['festivals_and_events']) ? $data['festivals_and_events'] : [];
    $festivals_json = is_array($festivals) ? json_encode($festivals) : null;

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Verify location exists
    $locationQuery = "SELECT id FROM locations WHERE id = ?";
    $stmt = $mysqli->prepare($locationQuery);
    $stmt->bind_param('i', $location_id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        sendError('Location not found', 'LOCATION_NOT_FOUND', 404);
    }

    // Insert temple
    $insertQuery = "
        INSERT INTO temples (name, deity, location_id, year_constructed, location_note, website, image_url, festivals_and_events, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";

    $stmt = $mysqli->prepare($insertQuery);
    if (!$stmt) {
        sendError('Prepare failed: ' . $mysqli->error, 'QUERY_ERROR', 500);
    }

    $stmt->bind_param('ssiissss', $name, $deity, $location_id, $year_constructed, $location_note, $website, $image_url, $festivals_json, $source);

    if (!$stmt->execute()) {
        sendError('Insert failed: ' . $stmt->error, 'INSERT_ERROR', 500);
    }

    $temple_id = $mysqli->insert_id;

    sendSuccess([
        'temple_id' => $temple_id,
        'message' => 'Temple added successfully'
    ]);

} catch (Exception $e) {
    error_log('addTemple error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
