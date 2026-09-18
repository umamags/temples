<?php
// PUT /backend/edit/updateLocation.php
// Update an existing location

require_once __DIR__ . '/../query/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        sendError('No data provided', 'INVALID_REQUEST', 400);
    }

    // Validate required fields
    if (!isset($data['location_id']) || !$data['location_id']) {
        sendError('location_id is required', 'MISSING_FIELD', 400);
    }

    $location_id = intval($data['location_id']);
    $state_id = isset($data['state_id']) ? intval($data['state_id']) : null;
    $name = isset($data['name']) ? trim($data['name']) : null;
    $slug = isset($data['slug']) ? trim($data['slug']) : null;
    $kind = isset($data['kind']) ? trim($data['kind']) : null;
    $lat = isset($data['lat']) ? floatval($data['lat']) : null;
    $lon = isset($data['lon']) ? floatval($data['lon']) : null;

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Verify location exists
    $checkQuery = "SELECT id FROM locations WHERE id = ?";
    $stmt = $mysqli->prepare($checkQuery);
    $stmt->bind_param('i', $location_id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        sendError('Location not found', 'LOCATION_NOT_FOUND', 404);
    }

    // Verify state exists if provided
    if ($state_id) {
        $stateQuery = "SELECT id FROM states WHERE id = ?";
        $stmt = $mysqli->prepare($stateQuery);
        $stmt->bind_param('i', $state_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            sendError('State not found', 'STATE_NOT_FOUND', 404);
        }
    }

    // Build update query dynamically
    $updates = [];
    $params = [];
    $types = '';

    if ($state_id !== null) { $updates[] = 'state_id = ?'; $params[] = $state_id; $types .= 'i'; }
    if ($name !== null) { $updates[] = 'name = ?'; $params[] = $name; $types .= 's'; }
    if ($slug !== null) { $updates[] = 'slug = ?'; $params[] = $slug; $types .= 's'; }
    if ($kind !== null) { $updates[] = 'kind = ?'; $params[] = $kind; $types .= 's'; }
    if ($lat !== null) { $updates[] = 'lat = ?'; $params[] = $lat; $types .= 'd'; }
    if ($lon !== null) { $updates[] = 'lon = ?'; $params[] = $lon; $types .= 'd'; }

    if (empty($updates)) {
        sendError('No fields to update', 'NO_UPDATE_FIELDS', 400);
    }

    $params[] = $location_id;
    $types .= 'i';

    $updateQuery = "UPDATE locations SET " . implode(', ', $updates) . " WHERE id = ?";

    $stmt = $mysqli->prepare($updateQuery);
    if (!$stmt) {
        sendError('Prepare failed: ' . $mysqli->error, 'QUERY_ERROR', 500);
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        sendError('Update failed: ' . $stmt->error, 'UPDATE_ERROR', 500);
    }

    sendSuccess([
        'location_id' => $location_id,
        'message' => 'Location updated successfully'
    ]);

} catch (Exception $e) {
    error_log('updateLocation error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
