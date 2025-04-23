#!/bin/bash

# Auto-commit script for Otonom Fund Frontend
# This script will automatically commit changes every hour to prevent work loss

echo "Starting auto-commit service for Otonom Fund Frontend..."
echo "Will commit changes every hour to the current branch"

while true; do
  # Get current timestamp
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  
  # Add all changes
  git add .
  
  # Commit with timestamp in message
  git commit -m "Auto-backup: $TIMESTAMP"
  
  echo "Changes auto-committed at $TIMESTAMP"
  
  # Wait for 1 hour (3600 seconds)
  sleep 3600
done
