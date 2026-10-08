<?php
// GET /backend/query/getCityTemples.php?city_id=145
// Returns all temples in a specific city/town
// Used by: CityDetailPage (useTemples hook)

require_once __DIR__ . '/db.php';

try {
    $cityId = isset($_GET['city_id']) ? intval($_GET['city_id']) : null;

    if (!$cityId) {
        sendError('City ID parameter required', 'MISSING_PARAM', 400);
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Verify city exists
    $checkCity = "SELECT id FROM locations WHERE id = ?";
    $checkStmt = $mysqli->prepare($checkCity);
    $checkStmt->bind_param('i', $cityId);
    $checkStmt->execute();

    if ($checkStmt->get_result()->num_rows === 0) {
        sendError('City not found', 'CITY_NOT_FOUND', 404);
    }

    // Get temples for the specific city
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
        WHERE l.id = ?
        ORDER BY t.name
    ";

    $stmt = $mysqli->prepare($query);
    if (!$stmt) {
        sendError('Query preparation failed', 'QUERY_ERROR', 500);
    }

    $stmt->bind_param('i', $cityId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError('No temples found in this city', 'NO_TEMPLES', 404);
    }

    $temples = [];
    while ($row = $result->fetch_assoc()) {
        $temples[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'deity' => $row['deity'],
            'location_note' => $row['location_note'],
            'city' => $row['city'],
            'type' => $row['type'],
            'lat' => (float)$row['lat'],
            'lon' => (float)$row['lon'],
            'state' => $row['state'],
            'state_id' => (int)$row['state_id'],
            'location_id' => (int)$row['location_id']
        ];
    }

    sendSuccess($temples, ['count' => count($temples)]);

} catch (Exception $e) {
    error_log('getCityTemples error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
