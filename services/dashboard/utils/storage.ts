// Storage Helper with fallback for Safari Private Mode
// Tries: LocalStorage → SessionStorage → Cookies

class StorageHelper {
    private storageType: 'localStorage' | 'sessionStorage' | 'cookie' = 'localStorage';

    constructor() {
        this.detectStorage();
    }

    private detectStorage() {
        // Try localStorage
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            this.storageType = 'localStorage';
            console.log('✅ Using localStorage');
            return;
        } catch (e) {
            console.warn('⚠️ localStorage blocked, trying sessionStorage');
        }

        // Try sessionStorage
        try {
            const test = '__storage_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            this.storageType = 'sessionStorage';
            console.log('✅ Using sessionStorage');
            return;
        } catch (e) {
            console.warn('⚠️ sessionStorage blocked, falling back to cookies');
        }

        // Fallback to cookies
        this.storageType = 'cookie';
        console.log('✅ Using cookies');
    }

    setItem(key: string, value: string): void {
        try {
            if (this.storageType === 'localStorage') {
                localStorage.setItem(key, value);
            } else if (this.storageType === 'sessionStorage') {
                sessionStorage.setItem(key, value);
            } else {
                // Cookie fallback
                const expires = new Date();
                expires.setDate(expires.getDate() + 7); // 7 days
                document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            }
        } catch (error) {
            console.error('Storage setItem failed:', error);
        }
    }

    getItem(key: string): string | null {
        try {
            if (this.storageType === 'localStorage') {
                return localStorage.getItem(key);
            } else if (this.storageType === 'sessionStorage') {
                return sessionStorage.getItem(key);
            } else {
                // Cookie fallback
                const name = key + '=';
                const decodedCookie = decodeURIComponent(document.cookie);
                const ca = decodedCookie.split(';');
                for (let i = 0; i < ca.length; i++) {
                    let c = ca[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) === 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('Storage getItem failed:', error);
            return null;
        }
    }

    removeItem(key: string): void {
        try {
            if (this.storageType === 'localStorage') {
                localStorage.removeItem(key);
            } else if (this.storageType === 'sessionStorage') {
                sessionStorage.removeItem(key);
            } else {
                // Cookie fallback - set to expire immediately
                document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        } catch (error) {
            console.error('Storage removeItem failed:', error);
        }
    }

    clear(): void {
        try {
            if (this.storageType === 'localStorage') {
                localStorage.clear();
            } else if (this.storageType === 'sessionStorage') {
                sessionStorage.clear();
            } else {
                // Clear all cookies
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i];
                    const eqPos = cookie.indexOf('=');
                    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                }
            }
        } catch (error) {
            console.error('Storage clear failed:', error);
        }
    }
}

// Export singleton instance
export const storage = new StorageHelper();
