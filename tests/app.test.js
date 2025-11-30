const request = require('supertest');
const app = require('../app');

describe('App Tests', () => {
    describe('GET /', () => {
        test('должен возвращать HTML страницу', async () => {
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
            expect(response.text).toContain('DevOps Jenkins App');
            expect(response.text).toContain('Привет из DevOps Jenkins!');
        });
    });

    describe('POST /api/calculate', () => {
        test('должен корректно вычислять сумму', async () => {
            const response = await request(app)
                .post('/api/calculate')
                .send({ a: 5, b: 3 });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                a: 5,
                b: 3,
                result: 8
            });
        });

        test('должен возвращать ошибку при неверных типах', async () => {
            const response = await request(app)
                .post('/api/calculate')
                .send({ a: '5', b: 3 });
            
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('GET /health', () => {
        test('должен возвращать статус здоровья', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body.timestamp).toBeDefined();
        });
    });
});

