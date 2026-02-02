// AGRO-PASTO Service Worker - Permite funcionar offline
const CACHE_NAME = 'agro-pasto-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/images/icon-512.png',
    '/images/tifton_1_1769994515084.png',
    '/images/tifton_2_1769994579191.png',
    '/images/tifton_3_1769994594578.png',
    '/images/brs_acu_1_1769994532818.png',
    '/images/brs_acu_2_1769994608024.png',
    '/images/brs_acu_3_1769994641760.png',
    '/images/milho_1_1769994547760.png',
    '/images/milho_2_1769994655208.png',
    '/images/milho_3_1769994668875.png'
];

// Instalar Service Worker e cachear arquivos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.log('Erro ao cachear:', err);
            })
    );
    self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Interceptar requisições - Cache First, Network Fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retorna do cache se disponível
                if (response) {
                    return response;
                }

                // Senão, busca da rede
                return fetch(event.request)
                    .then(response => {
                        // Não cachear se não for válido
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar e cachear
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Se offline e não tem cache, mostrar página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

console.log('🌱 AGRO-PASTO Service Worker carregado!');
