"""Compatibility package so tests can import `db` regardless of CWD.

This package forwards the import path to the real `backend/db` folder
so `import db.database` works whether pytest runs from the repo root
or from the `backend/` folder.
"""
import os

# Adjust package search path to point to backend/db
# The file lives at <repo>/db/__init__.py so go one level up to repo root,
# then into 'backend/db'. Use abspath to normalize the path on Windows.
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
backend_db = os.path.join(repo_root, 'backend', 'db')
__path__ = [backend_db]
