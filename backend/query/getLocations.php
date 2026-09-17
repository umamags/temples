<?php
// GET /backend/query/getLocations.php
// Returns all locations (cities/towns) with their IDs, state info, and coordinates
// Used by: HomePage, IndiaMap

require_once __DIR__ . '/db.php';

try {
    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    $query = "
        SELECT
            l.id,
            l.name,
            l.slug,
            l.kind,
            l.lat,
            l.lon,
            s.id as state_id,
            s.name as state,
            s.slug as state_slug,
            COUNT(DISTINCT t.id) as temple_count
        FROM locations l
        JOIN states s ON l.state_id = s.id
        LEFT JOIN temples t ON t.location_id = l.id
        GROUP BY l.id, l.name, l.slug, l.kind, l.lat, l.lon, s.id, s.name, s.slug
        ORDER BY s.name, l.name
    ";

    $result = $mysqli->query($query);

    if (!$result) {
        sendError('Failed to fetch locations', 'QUERY_ERROR', 500);
    }

    $locations = [];
    while ($row = $result->fetch_assoc()) {
        $locations[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'kind' => $row['kind'],
            'lat' => (float)$row['lat'],
            'lon' => (float)$row['lon'],
            'state_id' => (int)$row['state_id'],
            'state' => $row['state'],
            'state_slug' => $row['state_slug'],
            'temple_count' => (int)$row['temple_count']
        ];
    }

    sendSuccess($locations, ['count' => count($locations)]);

} catch (Exception $e) {
    error_log('getLocations error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
