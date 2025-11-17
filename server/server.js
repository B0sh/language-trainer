import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;

if (!OPENROUTER_API_KEY || !PORT || !OPENROUTER_MODEL) {
    console.error('ERROR: environment variables not set.');
    process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Global rate limiting
// 100 requests per 15 minutes
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Per-IP rate limiting
// 30 requests per 5 minutes per IP
const perIpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: {
        error: 'Too many requests from your IP address, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);
app.use('/api', perIpLimiter);

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.post('/api/v1/chat/completions', async (req, res) => {
    try {
        const { messages, temperature, response_format, } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Invalid request: messages array is required'
            });
        }

        const openRouterRequest = {
            model: OPENROUTER_MODEL,
            messages,
            temperature: temperature || 0.7,
        };

        if (response_format) {
            openRouterRequest.response_format = response_format;
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                // 'HTTP-Referer': req.headers['x-referer'] || 'http://localhost',
                // 'X-Title': req.headers['x-title'] || 'Waldens World Proxy',
            },
            body: JSON.stringify(openRouterRequest),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);

            return res.status(response.status).json({
                error: `OpenRouter API error: ${response.status}`,
                details: errorText
            });
        }

        const completion = await response.json();
        res.json(completion);

    } catch (error) {
        console.error('Proxy server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`Started port ${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
