<?php
// POST /backend/edit/addLocation.php
// Add a new location (city/town) to the database

require_once __DIR__ . '/../query/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        sendError('No data provided', 'INVALID_REQUEST', 400);
    }

    // Validate required fields
    $required = ['state_id', 'name', 'kind', 'lat', 'lon'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            sendError("Missing required field: $field", 'MISSING_FIELD', 400);
        }
    }

    $state_id = intval($data['state_id']);
    $name = trim($data['name']);
    $slug = isset($data['slug']) ? trim($data['slug']) : strtolower(str_replace(' ', '-', $name));
    $kind = trim($data['kind']);
    $lat = floatval($data['lat']);
    $lon = floatval($data['lon']);

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Verify state exists
    $stateQuery = "SELECT id FROM states WHERE id = ?";
    $stmt = $mysqli->prepare($stateQuery);
    $stmt->bind_param('i', $state_id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        sendError('State not found', 'STATE_NOT_FOUND', 404);
    }

    // Insert location
    $insertQuery = "
        INSERT INTO locations (state_id, name, slug, kind, lat, lon)
        VALUES (?, ?, ?, ?, ?, ?)
    ";

    $stmt = $mysqli->prepare($insertQuery);
    if (!$stmt) {
        sendError('Prepare failed: ' . $mysqli->error, 'QUERY_ERROR', 500);
    }

    $stmt->bind_param('isssdd', $state_id, $name, $slug, $kind, $lat, $lon);

    if (!$stmt->execute()) {
        sendError('Insert failed: ' . $stmt->error, 'INSERT_ERROR', 500);
    }

    $location_id = $mysqli->insert_id;

    sendSuccess([
        'location_id' => $location_id,
        'message' => 'Location added successfully'
    ]);

} catch (Exception $e) {
    error_log('addLocation error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
