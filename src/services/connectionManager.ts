import { apiClient } from '../api/baseUrl';

export type ConnectionState = 'OK' | 'NO_INTERNET' | 'SERVER_LOST';

type Listener = (state: ConnectionState, isRetrying: boolean) => void;

class ConnectionManager {
  private state: ConnectionState = 'OK';
  private isRetrying: boolean = false;
  private listeners: Set<Listener> = new Set();
  private retryIntervalId: number | null = null;
  private backgroundCheckIntervalId: number | null = null;
  private inFlightHealthCheck: Promise<boolean> | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Lazy setup or manual start
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Browser online / offline listeners
    window.addEventListener('offline', this.handleOffline);
    window.addEventListener('online', this.handleOnline);

    // 2. Initial state check
    if (!navigator.onLine) {
      this.setState('NO_INTERNET');
    } else {
      // Check server availability when app opens
      this.checkServerHealth().then((isHealthy) => {
        if (!isHealthy) {
          // Double check internet first
          if (!navigator.onLine) {
            this.setState('NO_INTERNET');
          } else {
            this.setState('SERVER_LOST');
          }
        }
      });
    }

    // 3. Periodic monitoring while running (every 15 seconds)
    this.startBackgroundMonitoring();

    // 4. Register interceptor on existing apiClient
    this.setupAxiosInterceptor();
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public getIsRetrying(): boolean {
    return this.isRetrying;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Notify immediately of current state
    listener(this.state, this.isRetrying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state, this.isRetrying));
  }

  private setState(newState: ConnectionState) {
    if (this.state === newState) return;
    this.state = newState;

    if (this.state === 'OK') {
      this.stopRetryInterval();
    } else {
      this.startRetryInterval();
    }

    this.notify();
  }

  private handleOffline = () => {
    // Immediately show No Internet Connection
    this.setState('NO_INTERNET');
  };

  private handleOnline = () => {
    // When browser reports back online, verify both internet and server
    this.verifyAndRecover();
  };

  /**
   * Health check for server reachability using existing apiClient
   * Deduplicates concurrent checks and sets reasonable timeout.
   */
  public async checkServerHealth(): Promise<boolean> {
    if (this.inFlightHealthCheck) {
      return this.inFlightHealthCheck;
    }

    this.inFlightHealthCheck = (async () => {
      try {
        // Use existing apiClient calling health endpoint
        // config has _isHealthCheck: true to avoid interceptor recursion
        const res = await apiClient.get('/health', {
          timeout: 5000,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
          params: { _t: Date.now() },
          // @ts-expect-error custom config flag
          _isHealthCheck: true,
        });

        return res.status >= 200 && res.status < 400;
      } catch (err: any) {
        // If server returned 404 for /health or 500, but responded, check direct /api/health
        if (err?.response) {
          // Server is actually reachable if we got a response!
          return true;
        }
        return false;
      } finally {
        this.inFlightHealthCheck = null;
      }
    })();

    return this.inFlightHealthCheck;
  }

  /**
   * Fast internet connectivity verification
   */
  public async checkInternetConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    // Try a lightweight fetch to verify internet access
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      // Ping a reliable CDN/empty endpoint with no-cors
      await fetch(`https://www.google.com/generate_204?_t=${Date.now()}`, {
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return true;
    } catch {
      // If public check fails, check if we can at least reach local server
      // (If local server responds, user has network connection)
      const serverUp = await this.checkServerHealth();
      return serverUp;
    }
  }

  /**
   * Report network error detected from Axios response interceptor
   */
  public async reportNetworkError() {
    // 1. Check if internet is disconnected first (priority)
    if (!navigator.onLine) {
      this.setState('NO_INTERNET');
      return;
    }

    // 2. Confirm server unavailability before blocking the application
    const isHealthy = await this.checkServerHealth();
    if (!isHealthy) {
      if (!navigator.onLine) {
        this.setState('NO_INTERNET');
      } else {
        this.setState('SERVER_LOST');
      }
    }
  }

  /**
   * Report successful API call from Axios response interceptor
   */
  public reportSuccess() {
    if (this.state !== 'OK') {
      this.setState('OK');
    }
  }

  /**
   * Setup interceptor on apiClient without disrupting existing logic
   */
  private setupAxiosInterceptor() {
    apiClient.interceptors.response.use(
      (response) => {
        // If an API call succeeds, the server is healthy
        if (this.state !== 'OK') {
          this.setState('OK');
        }
        return response;
      },
      async (error) => {
        // Ignore cancelled requests
        if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
          return Promise.reject(error);
        }

        // Ignore internal health-check requests
        if (error?.config?._isHealthCheck) {
          return Promise.reject(error);
        }

        // Do not trigger modal for ordinary HTTP errors (400, 401, 403, 404, 500)
        // Only trigger on network errors, timeouts, or connection failures
        if (!error.response) {
          const isNetworkError =
            error.code === 'ERR_NETWORK' ||
            error.code === 'ECONNABORTED' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNREFUSED' ||
            error.message?.includes('Network Error') ||
            error.message?.includes('timeout');

          if (isNetworkError) {
            this.reportNetworkError();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Start 15-second auto retry interval when in error state
   */
  private startRetryInterval() {
    if (this.retryIntervalId !== null) return;

    this.retryIntervalId = window.setInterval(() => {
      this.verifyAndRecover();
    }, 15000);
  }

  private stopRetryInterval() {
    if (this.retryIntervalId !== null) {
      window.clearInterval(this.retryIntervalId);
      this.retryIntervalId = null;
    }
  }

  /**
   * Background monitoring while running normally (every 15 seconds)
   */
  private startBackgroundMonitoring() {
    if (this.backgroundCheckIntervalId !== null) return;

    this.backgroundCheckIntervalId = window.setInterval(async () => {
      // Only monitor in background if currently OK
      if (this.state === 'OK') {
        if (!navigator.onLine) {
          this.setState('NO_INTERNET');
          return;
        }

        const isHealthy = await this.checkServerHealth();
        if (!isHealthy) {
          // Confirm server unavailability before blocking
          const confirmedUnhealthy = !(await this.checkServerHealth());
          if (confirmedUnhealthy) {
            if (!navigator.onLine) {
              this.setState('NO_INTERNET');
            } else {
              this.setState('SERVER_LOST');
            }
          }
        }
      }
    }, 15000);
  }

  /**
   * Core verification and recovery logic
   */
  public async verifyAndRecover(): Promise<boolean> {
    // 1. Check internet first
    const hasInternet = navigator.onLine;

    if (!hasInternet) {
      this.setState('NO_INTERNET');
      return false;
    }

    // 2. Check server health
    const isServerHealthy = await this.checkServerHealth();

    if (isServerHealthy) {
      // Both internet and backend restored!
      this.setState('OK');
      return true;
    } else {
      // Internet is up, but server is down
      this.setState('SERVER_LOST');
      return false;
    }
  }

  /**
   * Manual retry triggered by user clicking the button
   */
  public async manualRetry(): Promise<boolean> {
    if (this.isRetrying) return false;

    this.isRetrying = true;
    this.notify();

    try {
      const recovered = await this.verifyAndRecover();
      return recovered;
    } finally {
      this.isRetrying = false;
      this.notify();
    }
  }

  public destroy() {
    window.removeEventListener('offline', this.handleOffline);
    window.removeEventListener('online', this.handleOnline);
    this.stopRetryInterval();
    if (this.backgroundCheckIntervalId !== null) {
      window.clearInterval(this.backgroundCheckIntervalId);
      this.backgroundCheckIntervalId = null;
    }
  }
}

export const connectionManager = new ConnectionManager();

