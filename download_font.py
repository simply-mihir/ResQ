import urllib.request
import json
import re

req = urllib.request.Request(
    'https://www.1001freefonts.com/eleven-twenty.font',
    headers={'User-Agent': 'Mozilla/5.0'}
)
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    # 1001freefonts download link usually looks like /d/1234/eleven-twenty.zip
    match = re.search(r'href="(/d/[0-9]+/[^"]+\.zip)"', html)
    if match:
        zip_url = "https://www.1001freefonts.com" + match.group(1)
        print("Found zip url:", zip_url)
        urllib.request.urlretrieve(zip_url, "font.zip")
        import zipfile
        with zipfile.ZipFile("font.zip", 'r') as zip_ref:
            for file in zip_ref.namelist():
                if file.lower().endswith('.ttf') or file.lower().endswith('.otf'):
                    zip_ref.extract(file, "/Users/mihir/Desktop/health/apps/web-app/public/fonts/")
                    print("Extracted:", file)
    else:
        print("Could not find download link on 1001freefonts")
except Exception as e:
    print("Error:", e)

