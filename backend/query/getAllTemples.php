<?php
// GET /backend/query/getAllTemples.php
// Returns all temples with state and location information
// Used by: HomePage (useAllTemples hook)

require_once __DIR__ . '/db.php';

try {
    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    $query = "
        SELECT
            t.id,
            t.name,
            t.deity,
            t.location_note,
            l.id as location_id,
            l.name as city,
            l.kind as type,
            l.lat,
            l.lon,
            s.id as state_id,
            s.name as state
        FROM temples t
        JOIN locations l ON t.location_id = l.id
        JOIN states s ON l.state_id = s.id
        ORDER BY s.name, l.name, t.name
    ";

    $result = $mysqli->query($query);

    if (!$result) {
        sendError('Failed to fetch temples', 'QUERY_ERROR', 500);
    }

    $temples = [];
    while ($row = $result->fetch_assoc()) {
        $temples[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'deity' => $row['deity'],
            'location_note' => $row['location_note'],
            'state' => $row['state'],
            'state_id' => (int)$row['state_id'],
            'town' => $row['city'],
            'location_id' => (int)$row['location_id'],
            'type' => $row['type'],
            'lat' => (float)$row['lat'],
            'lon' => (float)$row['lon']
        ];
    }

    sendSuccess($temples, ['count' => count($temples)]);

} catch (Exception $e) {
    error_log('getAllTemples error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
