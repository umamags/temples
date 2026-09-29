<?php
// POST /backend/admin/analyzeApis.php
// Analyzes all backend APIs and returns their parameters

header('Content-Type: application/json; charset=utf-8');

$backendDir = __DIR__ . '/..';
$apis = [];

function analyzePhpFile($filePath, $relativePath) {
    $content = file_get_contents($filePath);

    // Extract method from comments (GET or POST)
    $method = 'GET';
    if (preg_match('/POST\s+\//', $content)) {
        $method = 'POST';
    } elseif (preg_match('/PUT\s+\//', $content)) {
        $method = 'PUT';
    } elseif (preg_match('/DELETE\s+\//', $content)) {
        $method = 'DELETE';
    }

    // Extract parameters from $_GET, $_POST, $_REQUEST
    $params = [];

    // Find all isset checks for parameters
    if (preg_match_all('/\$_(?:GET|POST|REQUEST)\[[\'"](.*?)[\'"]\]/', $content, $matches)) {
        foreach ($matches[1] as $param) {
            $params[$param] = ['required' => false, 'type' => 'string'];
        }
    }

    // Check for required parameters (those that cause errors if missing)
    if (preg_match_all('/isset\(\$_(?:GET|POST|REQUEST)\[[\'"](.*?)[\'"]\]\)\s*\?\s*[^:]*:\s*(?:sendError|throw|exit)/', $content, $matches)) {
        foreach ($matches[1] as $param) {
            if (isset($params[$param])) {
                $params[$param]['required'] = true;
            }
        }
    }

    // Infer types
    foreach ($params as $name => $info) {
        if (strpos($name, 'id') !== false || strpos($name, 'ID') !== false) {
            $params[$name]['type'] = 'number';
        } elseif (strpos($name, 'limit') !== false || strpos($name, 'offset') !== false) {
            $params[$name]['type'] = 'number';
        }
    }

    return [
        'path' => $relativePath,
        'method' => $method,
        'params' => $params,
        'description' => extractDescription($content)
    ];
}

function extractDescription($content) {
    // Extract first comment line after opening php tag
    if (preg_match('/\/\/\s*(?:GET|POST|PUT|DELETE|[A-Z].*?)\s*\n\/\/\s*(.*?)(?:\n|$)/', $content, $matches)) {
        return trim($matches[1]);
    }
    return '';
}

// Analyze query APIs
$queryDir = $backendDir . '/query';
if (is_dir($queryDir)) {
    foreach (scandir($queryDir) as $file) {
        if (substr($file, -4) === '.php' && $file !== 'db.php' && $file !== 'connect_to_db.php') {
            $filePath = $queryDir . '/' . $file;
            $relativePath = 'query/' . substr($file, 0, -4);
            $apis[] = analyzePhpFile($filePath, $relativePath);
        }
    }
}

// Analyze edit APIs
$editDir = $backendDir . '/edit';
if (is_dir($editDir)) {
    foreach (scandir($editDir) as $file) {
        if (substr($file, -4) === '.php') {
            $filePath = $editDir . '/' . $file;
            $relativePath = 'edit/' . substr($file, 0, -4);
            $apis[] = analyzePhpFile($filePath, $relativePath);
        }
    }
}

// Sort by path
usort($apis, function($a, $b) {
    return strcmp($a['path'], $b['path']);
});

echo json_encode(['success' => true, 'apis' => $apis]);
?>
