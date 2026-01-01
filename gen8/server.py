"""
Simple HTTP server to run the Solar System Simulator.
Run this script and open http://localhost:8000 in your browser.

Usage:
    python server.py
    
Then open: http://localhost:8000
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from functools import partial

PORT = 8000

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS headers and proper MIME types for ES modules."""
    
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
    }
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # Custom log format
        message = format % args
        if '200' in message or '304' in message:
            print(f"  ✓ {message}")
        elif '404' in message:
            print(f"  ✗ {message}")
        else:
            print(f"  • {message}")


def main():
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create handler with the current directory
    handler = partial(CORSRequestHandler, directory=os.getcwd())
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            url = f"http://localhost:{PORT}"
            
            print()
            print("╔════════════════════════════════════════════════════════╗")
            print("║         🌌 SOLAR SYSTEM SIMULATOR SERVER 🌌            ║")
            print("╠════════════════════════════════════════════════════════╣")
            print(f"║  Server running at: {url:<35} ║")
            print("║                                                        ║")
            print("║  Press Ctrl+C to stop the server                       ║")
            print("╚════════════════════════════════════════════════════════╝")
            print()
            print("Request log:")
            
            # Try to open browser automatically
            try:
                webbrowser.open(url)
                print(f"  → Opening {url} in your default browser...")
            except:
                print(f"  → Please open {url} in your browser")
            
            print()
            
            # Start serving
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 10048 or 'Address already in use' in str(e):
            print(f"\n❌ Error: Port {PORT} is already in use.")
            print(f"   Try closing other applications or use a different port.")
            sys.exit(1)
        raise
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Goodbye!")
        sys.exit(0)


if __name__ == "__main__":
    main()
