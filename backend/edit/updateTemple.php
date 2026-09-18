<?php
// PUT /backend/edit/updateTemple.php
// Update an existing temple

require_once __DIR__ . '/../query/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['temple_id'])) {
        sendError('temple_id is required', 'MISSING_FIELD', 400);
    }

    $temple_id = intval($data['temple_id']);

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Verify temple exists
    $checkQuery = "SELECT id FROM temples WHERE id = ?";
    $stmt = $mysqli->prepare($checkQuery);
    $stmt->bind_param('i', $temple_id);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        sendError('Temple not found', 'TEMPLE_NOT_FOUND', 404);
    }

    // Verify location exists if provided
    if (isset($data['location_id'])) {
        $location_id = intval($data['location_id']);
        $locQuery = "SELECT id FROM locations WHERE id = ?";
        $stmt = $mysqli->prepare($locQuery);
        $stmt->bind_param('i', $location_id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows === 0) {
            sendError('Location not found', 'LOCATION_NOT_FOUND', 404);
        }
    }

    // Build update query dynamically
    $updates = [];
    $params = [];
    $types = '';

    if (isset($data['name'])) { $updates[] = 'name = ?'; $params[] = trim($data['name']); $types .= 's'; }
    if (isset($data['deity'])) { $updates[] = 'deity = ?'; $params[] = trim($data['deity']); $types .= 's'; }
    if (isset($data['location_id'])) { $updates[] = 'location_id = ?'; $params[] = intval($data['location_id']); $types .= 'i'; }
    if (isset($data['year_constructed'])) { $updates[] = 'year_constructed = ?'; $params[] = intval($data['year_constructed']); $types .= 'i'; }
    if (isset($data['location_note'])) { $updates[] = 'location_note = ?'; $params[] = trim($data['location_note']); $types .= 's'; }
    if (isset($data['website'])) { $updates[] = 'website = ?'; $params[] = trim($data['website']); $types .= 's'; }
    if (isset($data['image_url'])) { $updates[] = 'image_url = ?'; $params[] = trim($data['image_url']); $types .= 's'; }
    if (isset($data['source'])) { $updates[] = 'source = ?'; $params[] = trim($data['source']); $types .= 's'; }
    if (isset($data['festivals_and_events'])) {
        $festivals = is_array($data['festivals_and_events']) ? json_encode($data['festivals_and_events']) : $data['festivals_and_events'];
        $updates[] = 'festivals_and_events = ?';
        $params[] = $festivals;
        $types .= 's';
    }
    if (isset($data['description'])) { $updates[] = 'description = ?'; $params[] = trim($data['description']); $types .= 's'; }
    if (isset($data['photo_urls'])) {
        $photos = is_array($data['photo_urls']) ? json_encode($data['photo_urls']) : $data['photo_urls'];
        $updates[] = 'photo_urls = ?';
        $params[] = $photos;
        $types .= 's';
    }
    if (isset($data['video_urls'])) {
        $videos = is_array($data['video_urls']) ? json_encode($data['video_urls']) : $data['video_urls'];
        $updates[] = 'video_urls = ?';
        $params[] = $videos;
        $types .= 's';
    }

    if (empty($updates)) {
        sendError('No fields to update', 'NO_UPDATE_FIELDS', 400);
    }

    // Always update the timestamp
    $updates[] = 'updated_at = CURRENT_TIMESTAMP';
    $params[] = $temple_id;
    $types .= 'i';

    $updateQuery = "UPDATE temples SET " . implode(', ', $updates) . " WHERE id = ?";

    $stmt = $mysqli->prepare($updateQuery);
    if (!$stmt) {
        sendError('Prepare failed: ' . $mysqli->error, 'QUERY_ERROR', 500);
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        sendError('Update failed: ' . $stmt->error, 'UPDATE_ERROR', 500);
    }

    sendSuccess([
        'temple_id' => $temple_id,
        'message' => 'Temple updated successfully'
    ]);

} catch (Exception $e) {
    error_log('updateTemple error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
