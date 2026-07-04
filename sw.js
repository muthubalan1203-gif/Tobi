// ===== TOBI / MUTHUBALAN PERSONAL APP — SERVICE WORKER =====
// Ithu index.html kூட SAME FOLDER-ல iruka vendum (same directory, same domain).
// Ithu illama: Lock Screen Notification velai seiyathu, Offline mode velai seiyathu.

const CACHE_NAME = 'muthubalan-tobi-v1';

// Install aagum bodhu udane activate aagum
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate aagum bodhu, ella open tabs-um udane idhe SW use pannum
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Basic Offline Fallback — Network fail aana cache-ல irundhu try pannum
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Notification click pannumbodhu — app-ஐ open/focus pannum
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// ===== PERIODIC BACKGROUND SYNC — App fully close aana bodhum reminder varradhukku BEST-EFFORT mechanism =====
// ⚠️ IMPORTANT LIMITATION: Idhu 100% GUARANTEE இல்லை. Exact time (5AM, 9AM...) ku thaan
// varும்nu certainty illa — Chrome browser thaan eppo idha run pannanும்னு (battery, engagement,
// network based ah) தானாக decide pannும். Minimum ~1 hour gap-ல் mattum trigger aaga try pannும்.
// TRUE exact-time push (app fully closed aanaalum) venumna, backend push server (Firebase Cloud
// Messaging mathiri) thevai — adhu single HTML file app-ல simple ah panna mudியாthu.
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'tobi-smart-reminders') {
    event.waitUntil(checkAndFireScheduledReminder());
  }
});

async function checkAndFireScheduledReminder() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const schedule = [
    { h: 5, m: 0, body: '🌅 Good Morning Muthubalan! Time for cold shower & sunlight!' },
    { h: 9, m: 0, body: "🍳 Breakfast time! Don't miss your eggs." },
    { h: 13, m: 0, body: '🍚 Lunch time! Rice + veggies + curd.' },
    { h: 17, m: 30, body: '🍌 Snack time! Banana + peanuts for energy.' },
    { h: 18, m: 0, body: '💪 Gym time! Check your Adaptive Workout AI.' },
    { h: 21, m: 0, body: '😴 Wind down time. Log your sleep data.' }
  ];
  // Periodic Sync exact minute-ல fire aagum-nu guarantee illa, adhunala ±30 min window vachi check pannurom
  const match = schedule.find(s => Math.abs((s.h * 60 + s.m) - nowMinutes) <= 30);
  if (match) {
    await self.registration.showNotification('Muthubalan Personal App', {
      body: match.body,
      icon: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png',
      tag: 'periodic-reminder-' + match.h
    });
  }
}
