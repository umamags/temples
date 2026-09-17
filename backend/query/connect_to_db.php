<?php
// Database connection test file
// This is a simple debug utility to verify database connectivity

require_once 'db.php';

try {
    // Get the database connection
    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Run a simple count query
    $result = $mysqli->query("SELECT COUNT(*) as total FROM temples");

    if (!$result) {
        throw new Exception("Query failed: " . $mysqli->error);
    }

    $row = $result->fetch_assoc();
    $count = $row['total'];

    echo "<h1>Database Connection Test</h1>";
    echo "<p><strong>Status:</strong> ✅ Connected Successfully</p>";
    echo "<p><strong>Total Temples in Database:</strong> " . htmlspecialchars($count) . "</p>";
    echo "<p><a href='getAllTemples.php'>View API Response</a></p>";

} catch (Exception $e) {
    http_response_code(500);
    echo "<h1>Database Connection Error</h1>";
    echo "<p><strong>Error:</strong></p>";
    echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>" . htmlspecialchars($e->getMessage()) . "</pre>";
    echo "<p><small>Check that dbconfig.json exists and contains valid credentials.</small></p>";
}
?>
