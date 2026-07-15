"""
Centralised HTTP error handlers.

All error responses follow the unified envelope:
  {
    "success": false,
    "error": {
      "code":    <http_status_int>,
      "message": "<human readable string>"
    }
  }
"""

import logging

from flask import Flask, jsonify

logger = logging.getLogger(__name__)


def register_error_handlers(app: Flask) -> None:
    """Attach all HTTP error handlers to *app*."""

    @app.errorhandler(400)
    def bad_request(exc):
        logger.warning("400 Bad Request: %s", exc)
        return jsonify({"success": False, "error": {"code": 400, "message": "Bad request"}}), 400

    @app.errorhandler(404)
    def not_found(exc):
        logger.warning("404 Not Found: %s", exc)
        return jsonify({"success": False, "error": {"code": 404, "message": "Resource not found"}}), 404

    @app.errorhandler(405)
    def method_not_allowed(exc):
        logger.warning("405 Method Not Allowed: %s", exc)
        return jsonify({"success": False, "error": {"code": 405, "message": "Method not allowed"}}), 405

    @app.errorhandler(500)
    def internal_error(exc):
        logger.error("500 Internal Server Error: %s", exc, exc_info=True)
        return jsonify({"success": False, "error": {"code": 500, "message": "An internal server error occurred"}}), 500
