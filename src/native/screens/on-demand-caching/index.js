const CACHE_NAME = 'Blob-Cache';

export function cacheBlob(url) {
  return fetch(url).then((blobCache) => {
    // eslint-disable-next-line no-undef
    return caches.open(CACHE_NAME).then((cache) => {
      return cache.put(url.replace('blob:', ''), blobCache);
    });
  });
}

export function removeCachedBlob(url) {
  // eslint-disable-next-line no-undef
  return caches.open(CACHE_NAME).then((cache) => {
    return cache.delete(url.replace('blob:', '')).then(function (response) {});
  });
}

export function getBlobFromCache(url) {
  // eslint-disable-next-line no-undef
  return caches
    .open(CACHE_NAME)
    .then((cache) => {
      return cache.match(url.replace('blob:', ''));
    })
    .then((res) => res.blob())
    .then((blobRes) => {
      return URL.createObjectURL(blobRes);
    });
}
