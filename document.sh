#!/bin/bash

# Function to display usage instructions
usage() {
  echo "Usage:"
  echo "  $0 local <username> <path to ecosystem.config.js>"
  echo "  $0 full <path to dev ecosystem.config.js> <path to test ecosystem.config.js> <path to prod ecosystem.config.js>"
  exit 1
}

# Ensure mode is provided
if [ $# -lt 1 ]; then
  usage
fi

MODE=$1

if [ "$MODE" == "local" ]; then
  if [ $# -ne 3 ]; then
    usage
  fi

    echo $USER
  USERNAME=$2
  CONFIG_PATH=$3

  echo "Running documentation for local user '$USERNAME' with config: $CONFIG_PATH"
  node nodeRedDocumentation.js "$USERNAME" "$CONFIG_PATH"

elif [ "$MODE" == "full" ]; then
  if [ $# -ne 4 ]; then
    usage
  fi

  echo "Running documentation for full mode (dev, test, prod)"


  # change into nodereddev
  echo "Generating for nodereddev with config: $2"
  sudo -u nodereddev node nodeRedDocumentation.js "nodereddev" "$2"

  #change into noderedtest
  echo "Generating for noderedtest with config: $3"
  sudo -u noderedtest node nodeRedDocumentation.js "noderedtest" "$3"

  # change into noderedprod
  echo "Generating for noderedprod with config: $4"
  sudo -u noderedprod node nodeRedDocumentation.js "noderedprod" "$4"

else
  usage
fi
