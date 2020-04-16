/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/testing-pwapp/',
  '/testing-pwapp/index.html',
  '/testing-pwapp/scripts/app.js',
  '/testing-pwapp/scripts/install.js',
  '/testing-pwapp/scripts/luxon-1.11.4.js',
  '/testing-pwapp/styles/inline.css',
  '/testing-pwapp/images/add.svg',
  '/testing-pwapp/images/clear-day.svg',
  '/testing-pwapp/images/clear-night.svg',
  '/testing-pwapp/images/cloudy.svg',
  '/testing-pwapp/images/fog.svg',
  '/testing-pwapp/images/hail.svg',
  '/testing-pwapp/images/install.svg',
  '/testing-pwapp/images/partly-cloudy-day.svg',
  '/testing-pwapp/images/partly-cloudy-night.svg',
  '/testing-pwapp/images/rain.svg',
  '/testing-pwapp/images/refresh.svg',
  '/testing-pwapp/images/sleet.svg',
  '/testing-pwapp/images/snow.svg',
  '/testing-pwapp/images/thunderstorm.svg',
  '/testing-pwapp/images/tornado.svg',
  '/testing-pwapp/images/wind.svg'
];

self.addEventListener('install', evt => {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  // CODELAB: Add fetch event handler here.
  if (evt.request.url.includes('/testing-pwapp/forecast/')) {
    console.log('[Service Worker] Fetch (data)', evt.request.url);
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      })
    );
    return;
  }
  evt.respondWith(
    fetch(evt.request).catch(() => {
      return caches.open(CACHE_NAME).then(cache => {
        return cache.match('offline.html');
      });
    })
  );
});
