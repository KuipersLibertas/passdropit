#!/usr/bin/env bash
# Upload an image to Filestreams and print the JSON upload response.
# Usage: FILESTREAMS_KEY1=... FILESTREAMS_KEY2=... scripts/filestreams-upload.sh path/to/image.png
# Keys come from environment variables only. Never commit them.
set -euo pipefail
API=https://www.filestreams.com/api/v2
: "${FILESTREAMS_KEY1:?set FILESTREAMS_KEY1}" "${FILESTREAMS_KEY2:?set FILESTREAMS_KEY2}"
file="${1:?usage: $0 image-file}"

auth=$(curl -sS -m 30 -X POST "$API/authorize" -d "key1=$FILESTREAMS_KEY1" -d "key2=$FILESTREAMS_KEY2")
tok=$(printf '%s' "$auth" | python3 -I -c 'import sys,json;d=json.load(sys.stdin);print(d["data"]["access_token"]+" "+d["data"]["account_id"])') \
  || { echo "authorize failed: $auth" >&2; exit 1; }
set -- $tok

curl -sS -m 120 -X POST "$API/file/upload" \
  -F "access_token=$1" -F "account_id=$2" -F "upload_file=@$file"
echo
curl -sS -m 30 -X POST "$API/disable_access_token" -d "access_token=$1" -d "account_id=$2" >/dev/null
