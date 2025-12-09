import sys
import socket
import traceback
try:
    import psycopg2
    from psycopg2 import __version__ as pg_version
except Exception as e:
    print('Could not import psycopg2:', repr(e))
    traceback.print_exc()
    sys.exit(1)

DSN = 'postgresql://postgres:postgres@localhost:5432/crud'
print('Python executable:', sys.executable)
print('psycopg2 version:', pg_version)
print('Attempting psycopg2.connect(...)')
try:
    conn = psycopg2.connect(DSN)
    print('psycopg2: connected successfully')
    conn.close()
except Exception as e:
    print('psycopg2 exception repr:', repr(e))
    traceback.print_exc()

print('\nNow doing raw TCP connect to localhost:5432 and reading first bytes (hex dump)')
try:
    s = socket.create_connection(('localhost', 5432), timeout=5)
    s.settimeout(2)
    try:
        data = s.recv(4096)
        if not data:
            print('No data received (empty)')
        else:
            print('Received bytes length:', len(data))
            print('Hex dump:', data.hex())
            try:
                print('Decoded (utf-8):', data.decode('utf-8'))
            except Exception as e:
                print('Decode utf-8 error:', repr(e))
    except socket.timeout:
        print('Socket recv timed out (no initial banner)')
    finally:
        s.close()
except Exception as e:
    print('Raw socket connect error:', repr(e))
    traceback.print_exc()
