// lib/version.js
/**
 * App versioning for cache busting and update detection
 */

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.6';

/**
 * Check if client version matches server version
 * Used to detect when app needs refresh
 */
export const checkVersion = async () => {
    if (typeof window === 'undefined') return true;

    try {
        const response = await fetch(`/api/version?t=${Date.now()}`);
        const data = await response.json();
        const serverVersion = data.version;
        const clientVersion = localStorage.getItem('app_version');

        // First time - just store the version, don't reload
        if (!clientVersion) {
            localStorage.setItem('app_version', serverVersion);
            return true;
        }

        if (clientVersion !== serverVersion) {
            // Version mismatch - trigger reload
            console.log(`Version mismatch: client=${clientVersion}, server=${serverVersion}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Version check failed:', error);
        return true; // Don't block on error
    }
};

/**
 * Force reload if version mismatch detected
 */
export const autoUpdateOnVersionChange = async () => {
    const isUpToDate = await checkVersion();

    if (!isUpToDate) {
        console.log('New version detected, performing full reset...');

        // 1. Clear ALL LocalStorage to remove stale data/sessions
        localStorage.clear();

        // 2. Clear Service Worker caches if any
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        // 3. Force hard reload from server
        window.location.reload(true);
    }
};

/**
 * Start periodic version checking
 */
export const startVersionCheck = (intervalMs = 60000) => { // Check every 1 minute
    if (typeof window === 'undefined') return;

    // DON'T check immediately - wait for first interval
    // This prevents reload loop on initial page load
    const interval = setInterval(autoUpdateOnVersionChange, intervalMs);

    // Cleanup function
    return () => clearInterval(interval);
};
