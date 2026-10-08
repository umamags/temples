<?php
// GET /backend/query/getTempleDetail.php?temple_id=930
// Returns full details for a single temple
// Used by: TempleDetailPage (useTempleDetail2 hook)

require_once __DIR__ . '/db.php';

try {
    $templeId = isset($_GET['temple_id']) ? intval($_GET['temple_id']) : null;

    if (!$templeId) {
        sendError('Temple ID parameter required', 'MISSING_PARAM', 400);
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Get the specific temple
    $query = "
        SELECT
            t.id,
            t.name,
            t.deity,
            t.location_note,
            l.id as location_id,
            l.name as city,
            l.kind as type,
            l.lat as location_lat,
            l.lon as location_lon,
            s.id as state_id,
            s.name as state
        FROM temples t
        JOIN locations l ON t.location_id = l.id
        JOIN states s ON l.state_id = s.id
        WHERE t.id = ?
        LIMIT 1
    ";

    $stmt = $mysqli->prepare($query);
    if (!$stmt) {
        sendError('Query preparation failed', 'QUERY_ERROR', 500);
    }

    $stmt->bind_param('i', $templeId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendError('Temple not found', 'TEMPLE_NOT_FOUND', 404);
    }

    $row = $result->fetch_assoc();

    $templeData = [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'deity' => $row['deity'],
        'location_note' => $row['location_note'],
        'town' => $row['city'],
        'city' => $row['city'],
        'type' => $row['type'],
        'lat' => (float)$row['location_lat'],
        'lon' => (float)$row['location_lon'],
        'location_lat' => (float)$row['location_lat'],
        'location_lon' => (float)$row['location_lon'],
        'state' => $row['state'],
        'state_id' => (int)$row['state_id'],
        'location_id' => (int)$row['location_id']
    ];

    sendSuccess($templeData);

} catch (Exception $e) {
    error_log('getTempleDetail error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
