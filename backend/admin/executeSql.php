<?php
// POST /backend/admin/executeSql.php
// Executes SELECT queries with safety checks

header('Content-Type: application/json; charset=utf-8');

// CORS
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'])) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../query/db.php';

function sendError($message, $code, $status = 400) {
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'code' => $code
    ]);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['sql'])) {
        sendError('SQL query is required', 'MISSING_SQL', 400);
    }

    $sql = trim($data['sql']);

    // Only allow SELECT queries for safety
    if (!preg_match('/^\s*SELECT\s+/i', $sql)) {
        sendError('Only SELECT queries are allowed', 'INVALID_QUERY', 400);
    }

    // Limit results to 1000
    if (!preg_match('/LIMIT\s+\d+\s*$/i', $sql)) {
        $sql .= ' LIMIT 1000';
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    $result = $mysqli->query($sql);

    if (!$result) {
        sendError('Query error: ' . $mysqli->error, 'QUERY_ERROR', 400);
    }

    $rows = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode([
        'success' => true,
        'rows' => $rows,
        'count' => count($rows)
    ]);

} catch (Exception $e) {
    error_log('executeSql error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 'DB_ERROR', 500);
}
?>
