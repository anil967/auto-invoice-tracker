// lib/version.js
/**
 * App versioning for cache busting and update detection
 * Uses server-side version headers instead of localStorage
 */

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.13';

/**
 * Check if client version matches server version
 * Used to detect when app needs refresh
 */
export const checkVersion = async () => {
    if (typeof window === 'undefined') return true;

    try {
        const response = await fetch(`/api/version?t=${Date.now()}`);

        if (!response.ok) {
            console.warn('Version check failed with status:', response.status);
            return true; // Don't block on error
        }

        const data = await response.json();
        const serverVersion = data.version;
        const clientVersion = APP_VERSION;

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
/**
 * Clears all site data to fix version conflicts
 */
const clearSiteData = async () => {
    try {
        console.log('Clearing site data...');

        // 1. Clear Local/Session Storage
        if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
        }

        // 2. Clear Cookies (simple ones, not HttpOnly)
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // 3. Clear Cache Storage (Service Workers)
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        // 4. Unregister Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(r => r.unregister()));
        }

        console.log('Site data cleared successfully.');
    } catch (e) {
        console.error('Error clearing site data:', e);
    }
};

/**
 * Force reload if version mismatch detected
 * Protected by a "reset lock" cookie to prevent infinite loops
 */
export const autoUpdateOnVersionChange = async () => {
    const isUpToDate = await checkVersion();

    if (!isUpToDate) {
        // Check for reset lock
        const hasResetLock = document.cookie.includes('version_reset_lock=true');

        if (hasResetLock) {
            console.warn('Version mismatch persisting after reset. Auto-reload aborted to prevent loop.');
            return;
        }

        console.log('New version detected. Performing ONE-TIME reset...');

        // Set lock cookie (expires in 2 minutes)
        const date = new Date();
        date.setTime(date.getTime() + (2 * 60 * 1000));
        document.cookie = `version_reset_lock=true; expires=${date.toUTCString()}; path=/`;

        // Clear data and reload
        await clearSiteData();
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
