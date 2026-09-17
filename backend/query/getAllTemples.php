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
            t.year_constructed,
            t.location_note,
            t.image_url,
            t.website,
            t.festivals_and_events,
            t.source,
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
            'year_constructed' => $row['year_constructed'] ? (int)$row['year_constructed'] : null,
            'location_note' => $row['location_note'],
            'image_url' => $row['image_url'],
            'website' => $row['website'],
            'source' => $row['source'],
            'festivals_and_events' => $row['festivals_and_events'] ?
                json_decode($row['festivals_and_events'], true) : [],
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
