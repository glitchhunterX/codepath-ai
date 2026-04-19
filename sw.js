self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('codepath-ai').then((cache) => cache.addAll([
      'index.html',
      'paths.html',
      'languages.html',
      'ai-tutor.html',
      'style.css',
      'script.js',
      'manifest.json'
    ]))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});