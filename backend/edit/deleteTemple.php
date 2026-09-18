<?php
// DELETE /backend/edit/deleteTemple.php
// Delete one or more temples (supports bulk delete)

require_once __DIR__ . '/../query/db.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        sendError('No data provided', 'INVALID_REQUEST', 400);
    }

    // Support both single temple_id and array of temple_ids for bulk delete
    $temple_ids = [];

    if (isset($data['temple_id'])) {
        $temple_ids[] = intval($data['temple_id']);
    } elseif (isset($data['temple_ids']) && is_array($data['temple_ids'])) {
        $temple_ids = array_map('intval', $data['temple_ids']);
    } else {
        sendError('temple_id or temple_ids array is required', 'MISSING_FIELD', 400);
    }

    if (empty($temple_ids)) {
        sendError('No temple IDs provided', 'INVALID_REQUEST', 400);
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Build placeholders for IN clause
    $placeholders = implode(',', array_fill(0, count($temple_ids), '?'));

    // Verify temples exist
    $checkQuery = "SELECT COUNT(*) as count FROM temples WHERE id IN ($placeholders)";
    $stmt = $mysqli->prepare($checkQuery);

    $types = str_repeat('i', count($temple_ids));
    $stmt->bind_param($types, ...$temple_ids);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row['count'] === 0) {
        sendError('No temples found with provided IDs', 'TEMPLE_NOT_FOUND', 404);
    }

    // Delete temples
    $deleteQuery = "DELETE FROM temples WHERE id IN ($placeholders)";
    $stmt = $mysqli->prepare($deleteQuery);
    if (!$stmt) {
        sendError('Prepare failed: ' . $mysqli->error, 'QUERY_ERROR', 500);
    }

    $stmt->bind_param($types, ...$temple_ids);

    if (!$stmt->execute()) {
        sendError('Delete failed: ' . $stmt->error, 'DELETE_ERROR', 500);
    }

    $deleted_count = $mysqli->affected_rows;

    sendSuccess([
        'deleted_count' => $deleted_count,
        'message' => "Successfully deleted $deleted_count temple(s)"
    ]);

} catch (Exception $e) {
    error_log('deleteTemple error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
