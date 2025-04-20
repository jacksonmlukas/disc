#!/bin/bash

# Check if username was provided
if [ -z "$1" ]; then
  echo "Error: Please provide a username."
  echo "Usage: ./make-admin.sh <username>"
  exit 1
fi

# Run the TypeScript file with the provided username
npx tsx server/scripts/make-admin.ts "$1"