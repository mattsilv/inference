#!/bin/bash

# Script to backup the database and maintain only the last 10 backups

# Set variables
BACKUP_DIR="/Users/mattsilverman/Documents/GitHub/inference/backup"
DB_PATH="/Users/mattsilverman/Documents/GitHub/inference/prisma/dev.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/dev_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Make the backup
cp "$DB_PATH" "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Database backup created successfully: $BACKUP_FILE"
else
  echo "Error creating database backup"
  exit 1
fi

# Keep only the last 10 backups
cd "$BACKUP_DIR"
ls -t *.db | tail -n +11 | xargs rm -f 2>/dev/null

# Count remaining backups
BACKUP_COUNT=$(ls -1 *.db 2>/dev/null | wc -l)
echo "Backup completed. Maintaining $BACKUP_COUNT backups in $BACKUP_DIR"