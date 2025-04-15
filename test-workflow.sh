#!/bin/bash

echo "=== Testing GitHub Actions Workflow Locally ==="
echo ""

echo "Step 1: Running ESLint"
npm run lint
if [ $? -ne 0 ]; then
  echo "ESLint failed!"
  exit 1
fi
echo "ESLint passed!"
echo ""

echo "Step 2: Checking Formatting"
npm run format:check
if [ $? -ne 0 ]; then
  echo "Formatting check failed!"
  exit 1
fi
echo "Formatting check passed!"
echo ""

echo "Step 3: Running Type Check"
npm run check:types
if [ $? -ne 0 ]; then
  echo "Type check failed!"
  exit 1
fi
echo "Type check passed!"
echo ""

echo "Step 4: Running Tests"
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed!"
  exit 1
fi
echo "Tests passed!"
echo ""

echo "All checks passed! The workflow is working correctly."
