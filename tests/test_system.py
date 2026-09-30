import unittest
import urllib.request
import json
import re
import os
import subprocess

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class TestWasteManagementSystem(unittest.TestCase):

    def test_01_javascript_syntax_integrity(self):
        """Verify all JS files pass syntax parsing with zero errors."""
        js_files = ["utils.js", "data.js", "auth.js", "report.js", "pickup.js", "tracking.js", "admin.js", "awareness.js", "app.js"]
        for js_file in js_files:
            path = os.path.join(BASE_DIR, "js", js_file)
            self.assertTrue(os.path.exists(path), f"File missing: {js_file}")
            res = subprocess.run(["node", "--check", path], capture_output=True, text=True)
            self.assertEqual(res.returncode, 0, f"Syntax error in {js_file}: {res.stderr}")

    def test_02_server_http_status_and_security_headers(self):
        """Verify local server is responding with HTTP 200 and security headers."""
        url = "http://localhost:3000/index.html"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            headers = {k.lower(): v for k, v in response.headers.items()}
            # Verify security headers
            self.assertIn('x-content-type-options', headers)
            self.assertEqual(headers['x-content-type-options'], 'nosniff')
            self.assertIn('x-frame-options', headers)
            self.assertEqual(headers['x-frame-options'], 'SAMEORIGIN')
            self.assertIn('x-xss-protection', headers)
            self.assertEqual(headers['x-xss-protection'], '1; mode=block')

    def test_03_xss_prevention_logic(self):
        """Verify that HTML entities are escaped to prevent Cross-Site Scripting (XSS)."""
        node_script = """
        const SecurityUtils = require('./js/utils.js');
        const malicious = '<script>alert("XSS")</script><img src=x onerror=alert(1)>';
        const escaped = SecurityUtils.escapeHTML(malicious);
        if (escaped.includes('<script>') || escaped.includes('<img')) {
            process.exit(1);
        }
        if (!escaped.includes('&lt;script&gt;') || !escaped.includes('&lt;img')) {
            process.exit(2);
        }
        console.log('XSS Sanitization Passed:', escaped);
        """
        res = subprocess.run(["node", "-e", node_script], cwd=BASE_DIR, capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"XSS prevention test failed: {res.stderr}")

    def test_04_csv_injection_prevention(self):
        """Verify that Excel Formula Injection (DDE) triggers are neutralized."""
        node_script = """
        const SecurityUtils = require('./js/utils.js');
        const payload1 = '=cmd|"/C calc"!A0';
        const payload2 = '@SUM(1+1)';
        const payload3 = '+12345';
        const payload4 = '-999';

        const s1 = SecurityUtils.sanitizeCSV(payload1);
        const s2 = SecurityUtils.sanitizeCSV(payload2);
        const s3 = SecurityUtils.sanitizeCSV(payload3);
        const s4 = SecurityUtils.sanitizeCSV(payload4);

        if (!s1.startsWith('\"\\\'=')) process.exit(1);
        if (!s2.startsWith('\"\\\'@')) process.exit(2);
        if (!s3.startsWith('\"\\\'+')) process.exit(3);
        if (!s4.startsWith('\"\\\'-')) process.exit(4);
        console.log('CSV Formula Injection Defense Passed');
        """
        res = subprocess.run(["node", "-e", node_script], cwd=BASE_DIR, capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"CSV injection test failed: {res.stderr}")

    def test_05_unsafe_url_protocol_defense(self):
        """Verify that javascript: pseudo-protocol is blocked."""
        node_script = """
        const SecurityUtils = require('./js/utils.js');
        const dangerous = 'javascript:alert(document.cookie)';
        const sanitized = SecurityUtils.sanitizeUrl(dangerous);
        if (sanitized.toLowerCase().startsWith('javascript:')) {
            process.exit(1);
        }
        const safe = 'https://images.unsplash.com/photo-123';
        if (SecurityUtils.sanitizeUrl(safe) !== safe) {
            process.exit(2);
        }
        console.log('URL Protocol Defense Passed');
        """
        res = subprocess.run(["node", "-e", node_script], cwd=BASE_DIR, capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"URL sanitization test failed: {res.stderr}")

    def test_06_file_upload_validation(self):
        """Verify file type and size validator."""
        node_script = """
        const SecurityUtils = require('./js/utils.js');

        // Test bad mime
        const exe = { type: 'application/x-msdownload', size: 1024 };
        if (SecurityUtils.validateImageFile(exe).valid) process.exit(1);

        // Test oversize
        const oversize = { type: 'image/jpeg', size: 10 * 1024 * 1024 };
        if (SecurityUtils.validateImageFile(oversize).valid) process.exit(2);

        // Test valid
        const valid = { type: 'image/jpeg', size: 1024 * 100 };
        if (!SecurityUtils.validateImageFile(valid).valid) process.exit(3);

        console.log('File Validation Defense Passed');
        """
        res = subprocess.run(["node", "-e", node_script], cwd=BASE_DIR, capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"File upload validator failed: {res.stderr}")

    def test_07_data_structure_completeness(self):
        """Verify initial seed data has all required modules."""
        data_path = os.path.join(BASE_DIR, "js", "data.js")
        with open(data_path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("users:", content)
        self.assertIn("complaints:", content)
        self.assertIn("pickupRequests:", content)
        self.assertIn("hotspots:", content)
        self.assertIn("binsGuide:", content)
        self.assertIn("quizQuestions:", content)

if __name__ == "__main__":
    unittest.main()
