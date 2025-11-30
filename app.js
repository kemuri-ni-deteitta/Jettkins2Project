const express = require('express');
const { calculateSum, getGreeting } = require('./utils/calculator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Главная страница
app.get('/', (req, res) => {
    const greeting = getGreeting();
    res.send(`
        <html>
            <head>
                <title>DevOps Jenkins App</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
                        color: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .container {
                        text-align: center;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                    }
                    h1 {
                        font-size: 2.5em;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 1.2em;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${greeting}</h1>
                    <p>Добро пожаловать в DevOps Jenkins приложение!</p>
                    <p>Версия: 1.0.0</p>
                </div>
            </body>
        </html>
    `);
});

// API endpoint для вычисления суммы
app.post('/api/calculate', (req, res) => {
    const { a, b } = req.body;
    
    if (typeof a !== 'number' || typeof b !== 'number') {
        return res.status(400).json({ 
            error: 'Параметры a и b должны быть числами' 
        });
    }
    
    const result = calculateSum(a, b);
    res.json({ 
        a, 
        b, 
        result 
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;

