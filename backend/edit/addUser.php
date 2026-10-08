<?php
// POST /backend/edit/addUser.php
// Creates or retrieves a user by username

require_once __DIR__ . '/../query/db.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['username'])) {
        sendError('Username is required', 'MISSING_USERNAME', 400);
    }

    $username = trim($input['username']);

    if (empty($username)) {
        sendError('Username cannot be empty', 'INVALID_USERNAME', 400);
    }

    $db = Database::getInstance();
    $mysqli = $db->getConnection();

    // Check if user exists
    $checkQuery = "SELECT id, username FROM users WHERE username = ?";
    $stmt = $mysqli->prepare($checkQuery);

    if (!$stmt) {
        sendError('Database error', 'DB_ERROR', 500);
    }

    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        sendSuccess([
            'id' => (int)$row['id'],
            'username' => $row['username']
        ]);
    }

    // User doesn't exist, create new user
    $insertQuery = "INSERT INTO users (username) VALUES (?)";
    $insertStmt = $mysqli->prepare($insertQuery);

    if (!$insertStmt) {
        sendError('Failed to create user', 'DB_ERROR', 500);
    }

    $insertStmt->bind_param('s', $username);
    $insertStmt->execute();

    $userId = $insertStmt->insert_id;

    sendSuccess([
        'id' => (int)$userId,
        'username' => $username
    ]);

} catch (Exception $e) {
    error_log('addUser error: ' . $e->getMessage());
    sendError('Server error', 'SERVER_ERROR', 500);
}
?>
