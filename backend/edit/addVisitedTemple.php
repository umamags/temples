<?php
// POST /backend/edit/addVisitedTemple.php
// Adds a temple to the user's visited temples list

require_once __DIR__ . '/../query/db.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['user_id']) || !isset($input['temple_id'])) {
        sendError('user_id and temple_id are required', 'MISSING_PARAMS', 400);
    }

    $userId = (int)$input['user_id'];
    $templeId = (int)$input['temple_id'];

    if ($userId <= 0 || $templeId <= 0) {
        sendError('Invalid user_id or temple_id', 'INVALID_PARAMS', 400);
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Check if already visited
    $checkQuery = "SELECT user_id FROM visited_temples WHERE user_id = ? AND temple_id = ?";
    $stmt = $mysqli->prepare($checkQuery);

    if (!$stmt) {
        sendError('Database error', 'DB_ERROR', 500);
    }

    $stmt->bind_param('ii', $userId, $templeId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        sendSuccess(['message' => 'Temple already marked as visited']);
    }

    // Insert new visited temple record
    $insertQuery = "INSERT INTO visited_temples (user_id, temple_id, visited_at) VALUES (?, ?, NOW())";
    $insertStmt = $mysqli->prepare($insertQuery);

    if (!$insertStmt) {
        sendError('Failed to add visited temple', 'DB_ERROR', 500);
    }

    $insertStmt->bind_param('ii', $userId, $templeId);
    $insertStmt->execute();

    sendSuccess([
        'message' => 'Temple marked as visited',
        'visited_id' => (int)$insertStmt->insert_id
    ]);

} catch (Exception $e) {
    error_log('addVisitedTemple error: ' . $e->getMessage());
    sendError('Server error', 'SERVER_ERROR', 500);
}
?>
