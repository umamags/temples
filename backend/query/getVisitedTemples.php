<?php
// GET /backend/query/getVisitedTemples.php?user_id=1
// Returns list of temples visited by a user

require_once __DIR__ . '/db.php';

try {
    if (!isset($_GET['user_id'])) {
        sendError('user_id is required', 'MISSING_PARAM', 400);
    }

    $userId = (int)$_GET['user_id'];

    if ($userId <= 0) {
        sendError('Invalid user_id', 'INVALID_PARAM', 400);
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    $query = "
        SELECT
            vt.id as visited_id,
            vt.temple_id,
            vt.visited_date,
            t.name,
            t.state,
            t.state_id,
            t.town,
            t.city,
            t.location_id,
            t.deity
        FROM visited_temples vt
        JOIN temples t ON vt.temple_id = t.id
        WHERE vt.user_id = ?
        ORDER BY vt.visited_date DESC
    ";

    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        sendError('Database error', 'DB_ERROR', 500);
    }

    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $temples = [];
    while ($row = $result->fetch_assoc()) {
        $temples[] = [
            'visited_id' => (int)$row['visited_id'],
            'temple_id' => (int)$row['temple_id'],
            'name' => $row['name'],
            'state' => $row['state'],
            'state_id' => (int)$row['state_id'],
            'town' => $row['town'],
            'city' => $row['city'],
            'location_id' => (int)$row['location_id'],
            'deity' => $row['deity'],
            'visited_date' => $row['visited_date']
        ];
    }

    sendSuccess($temples, ['count' => count($temples)]);

} catch (Exception $e) {
    error_log('getVisitedTemples error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
