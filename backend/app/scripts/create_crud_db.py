import os
import traceback

# Forzar decodificación compatible con el servidor si este usa Latin1/Windows-1252
os.environ['PGCLIENTENCODING'] = os.environ.get('PGCLIENTENCODING', 'LATIN1')

try:
    import psycopg2
except Exception as e:
    print('psycopg2 import error:', e)
    raise

DSN_ADMIN = 'postgresql://postgres:postgres@localhost:5432/postgres'
print('Using PGCLIENTENCODING=', os.environ.get('PGCLIENTENCODING'))
print('Connecting to postgres as admin to create database `crud` if needed')
try:
    conn = psycopg2.connect(DSN_ADMIN)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database WHERE datname='crud'")
    exists = cur.fetchone() is not None
    if exists:
        print('Database `crud` already exists')
    else:
        # Get server encoding
        cur.execute("SHOW server_encoding")
        enc = cur.fetchone()[0]
        print('Server encoding detected:', enc)
        # Create database with the server encoding
        sql = f"CREATE DATABASE crud OWNER postgres ENCODING '{enc}'"
        print('Executing:', sql)
        cur.execute(sql)
        print('Database `crud` created successfully')
    cur.close()
    conn.close()
except Exception as e:
    print('Exception during DB create:')
    traceback.print_exc()
    raise
