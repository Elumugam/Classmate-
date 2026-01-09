/**
 * Middleware to check if database is connected before proceeding
 * Returns a 503 Service Unavailable if DB is offline for DB-dependent routes
 */
const dbGuard = (req, res, next) => {
    if (!global.dbConnected) {
        console.warn(`[DB_GUARD] Blocking ${req.method} ${req.originalUrl} - Database is offline.`);
        return res.status(503).json({
            error: "Database Unavailable",
            message: "This feature is currently unavailable as the database is offline. The app is running in degraded mode.",
            degradedMode: true
        });
    }
    next();
};

module.exports = dbGuard;
