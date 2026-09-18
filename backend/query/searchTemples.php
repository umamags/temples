<?php
// GET /backend/query/searchTemples.php
// Search temples with optional filters by state, location, and name

require_once __DIR__ . '/db.php';

try {
    $state_id = isset($_GET['state_id']) ? intval($_GET['state_id']) : null;
    $location_id = isset($_GET['location_id']) ? intval($_GET['location_id']) : null;
    $name = isset($_GET['name']) ? trim($_GET['name']) : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Build query
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
            t.description,
            t.photo_urls,
            t.video_urls,
            t.updated_at,
            l.id as location_id,
            l.name as location_name,
            l.kind as location_type,
            l.lat,
            l.lon,
            s.id as state_id,
            s.name as state_name
        FROM temples t
        JOIN locations l ON t.location_id = l.id
        JOIN states s ON l.state_id = s.id
        WHERE 1=1
    ";

    $params = [];
    $types = '';

    // Add filters
    if ($state_id) {
        $query .= " AND s.id = ?";
        $params[] = $state_id;
        $types .= 'i';
    }

    if ($location_id) {
        $query .= " AND l.id = ?";
        $params[] = $location_id;
        $types .= 'i';
    }

    if ($name) {
        $query .= " AND t.name LIKE ?";
        $params[] = "%$name%";
        $types .= 's';
    }

    $query .= " ORDER BY s.name, l.name, t.name LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    $stmt = $mysqli->prepare($query);
    if (!$stmt) {
        sendError('Query preparation failed', 'QUERY_ERROR', 500);
    }

    if ($types) {
        $stmt->bind_param($types, ...$params);
    }

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
            'description' => $row['description'],
            'photo_urls' => $row['photo_urls'] ? json_decode($row['photo_urls'], true) : [],
            'video_urls' => $row['video_urls'] ? json_decode($row['video_urls'], true) : [],
            'festivals_and_events' => $row['festivals_and_events'] ? json_decode($row['festivals_and_events'], true) : [],
            'updated_at' => $row['updated_at'],
            'location_id' => (int)$row['location_id'],
            'location_name' => $row['location_name'],
            'location_type' => $row['location_type'],
            'lat' => (float)$row['lat'],
            'lon' => (float)$row['lon'],
            'state_id' => (int)$row['state_id'],
            'state_name' => $row['state_name']
        ];
    }

    sendSuccess($temples, ['count' => count($temples)]);

} catch (Exception $e) {
    error_log('searchTemples error: ' . $e->getMessage());
    sendError('Database error', 'DB_ERROR', 500);
}
?>
