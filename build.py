import re
r=lambda p:open('src/'+p,encoding='utf8').read()
css=r('style.css').replace('position:sticky;bottom:0','')
html=f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TuxLab — Aprende Linux en la terminal</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
{css}
</style>
</head>
<body>
{r('body.html')}
<script>
{r('engine.js')}
{r('content.js')}
{r('ui.js')}
</script>
</body>
</html>
'''
open('index.html','w',encoding='utf8').write(html)
print(len(html))
