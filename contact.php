<?php
/**
 * REAGAN WOKORACH PORTFOLIO — Contact Form Handler
 * File: php/contact.php
 *
 * Setup:
 * 1. Update $to below with your email
 * 2. Upload to any PHP hosting (InfinityFree, Hostinger free, etc.)
 * 3. Done — the JS will POST here automatically
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Allow only POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ===== CONFIGURATION =====
$to      = 'wokorachreagan5030@gmail.com'; // Your email
$from    = 'noreply@reaganwokorach.com';   // Sender display (can be any)
$siteName = 'Reagan Wokorach Portfolio';

// ===== SANITIZE INPUT =====
function sanitize($str) {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}

$name    = sanitize($_POST['name']    ?? '');
$email   = sanitize($_POST['email']   ?? '');
$subject = sanitize($_POST['subject'] ?? 'Portfolio Inquiry');
$message = sanitize($_POST['message'] ?? '');

// ===== VALIDATE =====
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email is required.';
}

if (strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
}

// Simple spam honeypot check
if (!empty($_POST['website'])) {
    echo json_encode(['success' => false, 'message' => 'Spam detected.']);
    exit;
}

// Rate limiting: basic file-based (1 request per IP per minute)
$rateLimitFile = sys_get_temp_dir() . '/rw_contact_' . md5($_SERVER['REMOTE_ADDR']);
if (file_exists($rateLimitFile) && (time() - filemtime($rateLimitFile)) < 60) {
    echo json_encode(['success' => false, 'message' => 'Please wait a moment before sending another message.']);
    exit;
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ===== COMPOSE EMAIL =====
$emailSubject = "[{$siteName}] {$subject}";

$emailBody = "
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <style>
    body { font-family: 'DM Sans', Arial, sans-serif; background: #f8f5ef; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
    .header { background: #1a2540; padding: 30px; text-align: center; }
    .header h1 { color: #c8a96e; font-size: 1.5rem; margin: 0; }
    .header p { color: rgba(255,255,255,0.5); font-size: 0.82rem; margin: 6px 0 0; }
    .body { padding: 32px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 0.72rem; color: #6b7a99; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .value { font-size: 0.95rem; color: #1a2540; line-height: 1.7; }
    .message-box { background: #f8f5ef; border-left: 3px solid #c8a96e; padding: 16px; border-radius: 4px; }
    .footer { background: #111827; padding: 20px; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.78rem; }
    .footer span { color: #c8a96e; }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>New Portfolio Message</h1>
      <p>Received from your portfolio contact form</p>
    </div>
    <div class='body'>
      <div class='field'>
        <div class='label'>From</div>
        <div class='value'>{$name}</div>
      </div>
      <div class='field'>
        <div class='label'>Email</div>
        <div class='value'><a href='mailto:{$email}' style='color:#c8a96e;'>{$email}</a></div>
      </div>
      <div class='field'>
        <div class='label'>Subject</div>
        <div class='value'>{$subject}</div>
      </div>
      <div class='field'>
        <div class='label'>Message</div>
        <div class='message-box value'>" . nl2br($message) . "</div>
      </div>
    </div>
    <div class='footer'>
      Sent via <span>Reagan Wokorach Portfolio</span> · " . date('F j, Y \a\t g:i A') . "
    </div>
  </div>
</body>
</html>
";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: {$siteName} <{$from}>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// ===== SEND EMAIL =====
$sent = mail($to, $emailSubject, $emailBody, $headers);

if ($sent) {
    // Update rate limit
    touch($rateLimitFile);
    echo json_encode([
        'success' => true,
        'message' => "Thank you, {$name}! Your message has been sent. I'll respond within 24 hours."
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Email could not be sent. Please email me directly at wokorachreagan5030@gmail.com'
    ]);
}
?>
