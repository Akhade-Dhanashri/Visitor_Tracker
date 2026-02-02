import json
import urllib.request
import urllib.error

API_BASE = 'http://127.0.0.1:8000/api'

new_user = {
    "name": "E2E Tester",
    "email": "e2e.tester+1@rachana.org",
    "password": "strongpass123",
    "role": "admin"
}

print('Creating user:', new_user['email'])
req = urllib.request.Request(
    API_BASE + '/users',
    data=json.dumps(new_user).encode('utf-8'),
    headers={ 'Content-Type': 'application/json' },
    method='POST'
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print('Create response status:', resp.status)
        print('Create response body:', body)
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code, e.read().decode())
except Exception as e:
    print('Error creating user:', e)

print('\nFetching users list...')
try:
    with urllib.request.urlopen(API_BASE + '/users', timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print('List response status:', resp.status)
        users = json.loads(body)
        print('Total users:', len(users))
        # print last 5 users
        for u in users[-5:]:
            print('-', u.get('id'), u.get('email'), u.get('role'), u.get('status'))
except Exception as e:
    print('Error fetching users:', e)
