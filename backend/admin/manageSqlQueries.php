<?php
// GET/POST /backend/admin/manageSqlQueries.php
// List, save, delete SQL queries

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
    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Ensure table exists
    $createTableSql = "CREATE TABLE IF NOT EXISTS saved_sql_queries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sql TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $mysqli->query($createTableSql);

    $method = $_SERVER['REQUEST_METHOD'];
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    // GET: List all saved queries
    if ($method === 'GET' && $action === 'list') {
        $result = $mysqli->query("SELECT id, name, sql, created_at, updated_at FROM saved_sql_queries ORDER BY updated_at DESC");
        $queries = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode([
            'success' => true,
            'queries' => $queries
        ]);
        exit;
    }

    // POST: Save new or update existing query
    if ($method === 'POST' && $action === 'save') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['name']) || !isset($data['sql'])) {
            sendError('Name and SQL are required', 'MISSING_FIELDS', 400);
        }

        $name = trim($data['name']);
        $sql = trim($data['sql']);

        if (empty($name) || empty($sql)) {
            sendError('Name and SQL cannot be empty', 'EMPTY_FIELDS', 400);
        }

        // Only allow SELECT queries
        if (!preg_match('/^\s*SELECT\s+/i', $sql)) {
            sendError('Only SELECT queries are allowed', 'INVALID_QUERY', 400);
        }

        // Check if exists
        $checkStmt = $mysqli->prepare("SELECT id FROM saved_sql_queries WHERE name = ?");
        $checkStmt->bind_param('s', $name);
        $checkStmt->execute();
        $exists = $checkStmt->get_result()->num_rows > 0;

        if ($exists) {
            // Update
            $updateStmt = $mysqli->prepare("UPDATE saved_sql_queries SET sql = ?, updated_at = NOW() WHERE name = ?");
            $updateStmt->bind_param('ss', $sql, $name);
            if (!$updateStmt->execute()) {
                sendError('Failed to update query', 'UPDATE_ERROR', 500);
            }
        } else {
            // Insert
            $insertStmt = $mysqli->prepare("INSERT INTO saved_sql_queries (name, sql) VALUES (?, ?)");
            $insertStmt->bind_param('ss', $name, $sql);
            if (!$insertStmt->execute()) {
                sendError('Failed to save query', 'INSERT_ERROR', 500);
            }
        }

        echo json_encode([
            'success' => true,
            'message' => $exists ? 'Query updated' : 'Query saved',
            'name' => $name
        ]);
        exit;
    }

    // DELETE: Delete a query
    if ($method === 'DELETE' && $action === 'delete') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['id'])) {
            sendError('ID is required', 'MISSING_ID', 400);
        }

        $id = intval($data['id']);

        $deleteStmt = $mysqli->prepare("DELETE FROM saved_sql_queries WHERE id = ?");
        $deleteStmt->bind_param('i', $id);
        if (!$deleteStmt->execute()) {
            sendError('Failed to delete query', 'DELETE_ERROR', 500);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Query deleted'
        ]);
        exit;
    }

    sendError('Invalid action', 'INVALID_ACTION', 400);

} catch (Exception $e) {
    error_log('manageSqlQueries error: ' . $e->getMessage());
    sendError('Database error: ' . $e->getMessage(), 'DB_ERROR', 500);
}
?>
