<?php
// DELETE /backend/edit/deleteLocation.php
// Delete a location (cascades delete all temples in this location)

require_once __DIR__ . '/../query/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['location_id'])) {
        sendError('location_id is required', 'MISSING_FIELD', 400);
    }

    $location_id = intval($data['location_id']);

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

    // Count temples that will be deleted
    $countQuery = "SELECT COUNT(*) as count FROM temples WHERE location_id = ?";
    $stmt = $mysqli->prepare($countQuery);
    $stmt->bind_param('i', $location_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $deleted_temples_count = intval($row['count']);

    // Delete location (cascade will delete temples due to foreign key constraint)
    $deleteQuery = "DELETE FROM locations WHERE id = ?";
    $stmt = $mysqli->prepare($deleteQuery);
    if (!$stmt) {
        sendError('Prepare failed: ' . $mysqli->error, 'QUERY_ERROR', 500);
    }

    $stmt->bind_param('i', $location_id);

    if (!$stmt->execute()) {
        sendError('Delete failed: ' . $stmt->error, 'DELETE_ERROR', 500);
    }

    sendSuccess([
        'location_id' => $location_id,
        'deleted_temples_count' => $deleted_temples_count,
        'message' => "Location deleted successfully (cascaded delete of $deleted_temples_count temples)"
    ]);

} catch (Exception $e) {
    error_log('deleteLocation error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
