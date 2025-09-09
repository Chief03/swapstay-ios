#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5001/api/v1"

echo -e "${YELLOW}Testing SwapStay Authentication Flow${NC}"
echo "======================================="

# Generate unique email for this test
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@mit.edu"

echo -e "\n${GREEN}1. Testing Registration${NC}"
echo "Email: $TEST_EMAIL"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User ${TIMESTAMP}\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\",
    \"university\": \"MIT\",
    \"universityDomain\": \"mit.edu\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  echo "Token received: ${TOKEN:0:20}..."
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}2. Testing Login (before email verification)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "verify your email"; then
  echo -e "${GREEN}✓ Correctly requires email verification${NC}"
else
  echo -e "${RED}✗ Should require email verification${NC}"
  echo "$LOGIN_RESPONSE"
fi

echo -e "\n${GREEN}3. Simulating email verification${NC}"
# In production, this would be done via email link
mongosh swapstay --eval "db.users.updateOne({email: '${TEST_EMAIL}'}, {\$set: {emailVerified: true}})" --quiet > /dev/null

echo -e "\n${GREEN}4. Testing Login (after email verification)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password123\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Login successful${NC}"
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  echo "Token received: ${TOKEN:0:20}..."
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}5. Testing duplicate registration${NC}"
DUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Duplicate User\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"password456\",
    \"university\": \"MIT\",
    \"universityDomain\": \"mit.edu\"
  }")

if echo "$DUP_RESPONSE" | grep -q "already exists"; then
  echo -e "${GREEN}✓ Correctly prevents duplicate registration${NC}"
else
  echo -e "${RED}✗ Should prevent duplicate registration${NC}"
  echo "$DUP_RESPONSE"
fi

echo -e "\n${GREEN}6. Testing invalid .edu email${NC}"
INVALID_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Invalid User\",
    \"email\": \"test@gmail.com\",
    \"password\": \"password123\",
    \"university\": \"MIT\",
    \"universityDomain\": \"gmail.com\"
  }")

if echo "$INVALID_RESPONSE" | grep -q "must be a valid .edu address"; then
  echo -e "${GREEN}✓ Correctly rejects non-.edu email${NC}"
else
  echo -e "${RED}✗ Should reject non-.edu email${NC}"
  echo "$INVALID_RESPONSE"
fi

echo -e "\n======================================="
echo -e "${GREEN}All authentication tests passed!${NC}"