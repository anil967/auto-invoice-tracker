// lib/version.js
/**
 * App versioning for cache busting and update detection
 */

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

/**
 * Check if client version matches server version
 * Used to detect when app needs refresh
 */
export const checkVersion = async () => {
    if (typeof window === 'undefined') return true;

    try {
        const response = await fetch('/api/version');
        const data = await response.json();
        const serverVersion = data.version;
        const clientVersion = localStorage.getItem('app_version');

        if (clientVersion && clientVersion !== serverVersion) {
            // Version mismatch - trigger reload
            console.log(`Version mismatch: client=${clientVersion}, server=${serverVersion}`);
            return false;
        }

        // Store current version
        localStorage.setItem('app_version', serverVersion);
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
        console.log('New version detected, reloading...');
        // Clear cache and reload
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        window.location.reload(true);
    }
};

/**
 * Start periodic version checking
 */
export const startVersionCheck = (intervalMs = 60000) => {
    if (typeof window === 'undefined') return;

    // Check immediately
    autoUpdateOnVersionChange();

    // Then check periodically
    const interval = setInterval(autoUpdateOnVersionChange, intervalMs);

    // Cleanup function
    return () => clearInterval(interval);
};
