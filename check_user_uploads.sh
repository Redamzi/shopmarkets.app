#!/bin/bash

# Prüfe Dateien im User-Upload-Verzeichnis
echo "=========================================="
echo "📁 PRÜFE USER-UPLOAD-VERZEICHNIS"
echo "=========================================="
echo ""

USER_ID="ae4a3b19-5f5d-4abb-8307-c38ccbf63218"

echo "User ID: $USER_ID"
echo ""

# Führe diese Befehle im API-Container aus:
echo "Befehle für Coolify Terminal (Service API):"
echo ""
echo "# 1. Liste alle Dateien im User-Verzeichnis:"
echo "ls -la /app/uploads/$USER_ID/"
echo ""
echo "# 2. Zeige Datei-Details:"
echo "find /app/uploads/$USER_ID/ -type f -exec ls -lh {} \;"
echo ""
echo "# 3. Zähle Dateien:"
echo "find /app/uploads/$USER_ID/ -type f | wc -l"
echo ""
echo "# 4. Zeige Datei-Typen:"
echo "find /app/uploads/$USER_ID/ -type f -exec file {} \;"
echo ""
