<?php
// GET /backend/query/getStateTemples.php?state_id=23
// Returns temples grouped by town/location for a specific state
// Used by: StateDetailPage (useStateTemples2 hook)

require_once __DIR__ . '/db.php';

try {
    $stateId = isset($_GET['state_id']) ? intval($_GET['state_id']) : null;

    if (!$stateId) {
        sendError('State ID parameter required', 'MISSING_PARAM', 400);
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Verify state exists
    $stateQuery = "SELECT id FROM states WHERE id = ?";
    $stmt = $mysqli->prepare($stateQuery);
    $stmt->bind_param('i', $stateId);
    $stmt->execute();
    $stateResult = $stmt->get_result();

    if ($stateResult->num_rows === 0) {
        sendError('State not found', 'STATE_NOT_FOUND', 404);
    }

    // Get all temples for this state
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
            l.name as town,
            l.kind as type,
            l.lat,
            l.lon,
            s.id as state_id,
            s.name as state
        FROM temples t
        JOIN locations l ON t.location_id = l.id
        JOIN states s ON l.state_id = s.id
        WHERE l.state_id = ?
        ORDER BY l.name, t.name
    ";

    $stmt = $mysqli->prepare($query);
    if (!$stmt) {
        sendError('Query preparation failed', 'QUERY_ERROR', 500);
    }

    $stmt->bind_param('i', $stateId);
    $stmt->execute();
    $result = $stmt->get_result();

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
            'town' => $row['town'],
            'location_id' => (int)$row['location_id'],
            'type' => $row['type'],
            'lat' => (float)$row['lat'],
            'lon' => (float)$row['lon'],
            'state' => $row['state'],
            'state_id' => (int)$row['state_id']
        ];
    }

    sendSuccess($temples, ['count' => count($temples)]);

} catch (Exception $e) {
    error_log('getStateTemples error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
