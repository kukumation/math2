#!/bin/bash
# Build script: combines JS/CSS into a single index.html for local use
cd "$(dirname "$0")"
echo "Building combined index.html..."
echo '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>Castle Math Quest</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<style>' > index_bundled.html

cat css/style.css >> index_bundled.html
echo '</style>
</head>
<body>' >> index_bundled.html

# Extract only the body content (between <body> and <!-- JS modules -->)
sed -n '/<body>/,/<!-- JS modules -->/p' index.html | grep -v '<body>' | grep -v '<!-- JS modules' >> index_bundled.html

echo '<script>' >> index_bundled.html
cat js/00-sprites.js js/01-utils.js js/02-save.js js/03-data.js js/04-achievements.js js/05-questions.js js/06-audio.js js/07-ui.js js/08-screens.js js/09-online.js js/10-init.js >> index_bundled.html
echo '</script>
</body>
</html>' >> index_bundled.html

echo "Done! Created index_bundled.html ($(wc -c < index_bundled.html) bytes)"
