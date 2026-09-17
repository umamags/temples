<?php
// Database connection helper
// Reads configuration from dbconfig.json based on environment

class Database {
    private static $instance = null;
    private $mysqli;

    private function __construct() {
        // Load configuration
        $config = $this->loadConfig();

        // Detect environment based on request origin
        $environment = $this->detectEnvironment();

        if (!isset($config[$environment])) {
            throw new Exception("Environment '$environment' not found in dbconfig.json");
        }

        $env_config = $config[$environment];

        $host = $env_config['host'];
        $db = $env_config['database'];
        $user = $env_config['user'];
        $pass = $env_config['password'];

        $this->mysqli = new mysqli($host, $user, $pass, $db);

        if ($this->mysqli->connect_error) {
            throw new Exception('Database connection failed: ' . $this->mysqli->connect_error);
        }

        $this->mysqli->set_charset('utf8mb4');
    }

    private function loadConfig() {
        $configFile = __DIR__ . '/dbconfig.json';

        if (!file_exists($configFile)) {
            throw new Exception(
                "Configuration file not found: $configFile\n" .
                "Please copy dbconfig-template.json to dbconfig.json and update with your values"
            );
        }

        $configJson = file_get_contents($configFile);
        $config = json_decode($configJson, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON in dbconfig.json: ' . json_last_error_msg());
        }

        if (!is_array($config)) {
            throw new Exception('dbconfig.json must contain a JSON object');
        }

        return $config;
    }

    private function detectEnvironment() {
        // Check if request has an origin header
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
        $serverName = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : '';

        // Combine all sources for checking
        $hostToCheck = $origin . $host . $serverName;

        // Check for production
        if (strpos($hostToCheck, 'ai-lab.in') !== false) {
            return 'prod';
        }

        // Check for localhost
        if (strpos($hostToCheck, 'localhost') !== false || strpos($hostToCheck, '127.0.0.1') !== false) {
            return 'local';
        }

        // Default to local for anything else
        return 'local';
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->mysqli;
    }

    public function close() {
        if ($this->mysqli) {
            $this->mysqli->close();
        }
    }
}

// Set CORS headers for localhost dev
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'])) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
// For production, set the actual domain:
// header('Access-Control-Allow-Origin: https://ai-lab.in');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Cache static data for 1 hour (commented out for dev - uncomment for production)
// header('Cache-Control: public, max-age=3600');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Handle OPTIONS preflight
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function sendError($message, $code = 'ERROR', $statusCode = 400) {
    sendJson([
        'success' => false,
        'error' => $message,
        'code' => $code
    ], $statusCode);
}

function sendSuccess($data, $meta = []) {
    $response = [
        'success' => true,
        'data' => $data
    ];

    if (!empty($meta)) {
        $response = array_merge($response, $meta);
    }

    sendJson($response);
}
