#!/bin/bash
if [ $# -eq 0 ]; then
    echo "ERROR: parameter tag expected, eg: v1.0.0"
    exit 1
fi
# TODO: run tests

read -p "About to commit release $1. Are you sure? (y/N) " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # do dangerous stuff
  git add -A 
  git status 
  git commit -m "release $1"
  git tag -a $1 -m "$1" 
  git push --tags
fi