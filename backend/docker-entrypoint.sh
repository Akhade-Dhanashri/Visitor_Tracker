#!/bin/bash
set -e

# Helper entrypoint for the backend container: waits for DB, installs deps, migrates and seeds, then starts Apache.

: ${DB_HOST:=db}
: ${DB_PORT:=5432}

echo "Waiting for database at $DB_HOST:$DB_PORT..."
# simple wait loop
while ! (</dev/tcp/$DB_HOST/$DB_PORT) 2>/dev/null; do
  sleep 1
  echo -n '.'
done

echo "\nDatabase reachable."

cd /var/www/html

# Install composer deps if vendor missing
if [ ! -d vendor ] || [ ! -f vendor/autoload.php ]; then
  echo "Installing composer dependencies..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate app key if not present
php artisan key:generate --force || true

# Run migrations and seed
echo "Running migrations..."
php artisan migrate --force || true

echo "Seeding database..."
php artisan db:seed --force || true

# Start Apache in foreground
echo "Starting Apache..."
apache2-foreground
