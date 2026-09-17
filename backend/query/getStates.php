<?php
// GET /backend/query/getStates.php
// Returns all states with their IDs and basic info
// Used by: HomePage, IndiaMap

require_once __DIR__ . '/db.php';

try {
    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    $query = "
        SELECT
            s.id,
            s.name,
            s.slug,
            s.total_temples,
            s.city_count,
            COUNT(DISTINCT l.id) as location_count,
            COUNT(DISTINCT t.id) as temple_count
        FROM states s
        LEFT JOIN locations l ON l.state_id = s.id
        LEFT JOIN temples t ON t.location_id = l.id
        GROUP BY s.id, s.name, s.slug, s.total_temples, s.city_count
        ORDER BY s.name
    ";

    $result = $mysqli->query($query);

    if (!$result) {
        sendError('Failed to fetch states', 'QUERY_ERROR', 500);
    }

    $states = [];
    while ($row = $result->fetch_assoc()) {
        $states[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'total_temples' => (int)$row['total_temples'],
            'city_count' => (int)$row['city_count'],
            'location_count' => (int)$row['location_count'],
            'temple_count' => (int)$row['temple_count']
        ];
    }

    sendSuccess($states, ['count' => count($states)]);

} catch (Exception $e) {
    error_log('getStates error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
