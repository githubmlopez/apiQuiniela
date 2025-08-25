export function obtCorsOpt(allowedOrigins) {
    const corsOptions = {
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                const error = new Error(`Origin '${origin}' not allowed by CORS`);
                callback(error);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods (important!)
        credentials: true,
    };
    return corsOptions;
}
