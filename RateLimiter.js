// RateLimiter class for managing request rate limits
class RateLimiter {
    constructor(limit, windowMs) {
        this.limit = limit; // Max number of requests allowed
        this.windowMs = windowMs; // Time window in milliseconds
        this.requests = new Map(); // Tracks user requests
    }

    // Method to check if a request is allowed
    isAllowed(userId) {
        const currentTime = Date.now();
        if (!this.requests.has(userId)) {
            this.requests.set(userId, []);
        }

        const userRequests = this.requests.get(userId);

        // Remove expired requests (outside the time window)
        while (userRequests.length > 0 && userRequests[0] <= currentTime - this.windowMs) {
            userRequests.shift();
        }

        if (userRequests.length < this.limit) {
            userRequests.push(currentTime);
            return true; // Request is allowed
        }

        return false; // Request is denied
    }
}

module.exports = RateLimiter;
