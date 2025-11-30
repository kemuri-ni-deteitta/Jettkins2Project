const { calculateSum, getGreeting } = require('../utils/calculator');

describe('Calculator Tests', () => {
    describe('calculateSum', () => {
        test('должна корректно складывать два положительных числа', () => {
            expect(calculateSum(2, 3)).toBe(5);
        });

        test('должна корректно складывать отрицательные числа', () => {
            expect(calculateSum(-2, -3)).toBe(-5);
        });

        test('должна корректно складывать положительное и отрицательное число', () => {
            expect(calculateSum(5, -3)).toBe(2);
        });

        test('должна корректно работать с нулем', () => {
            expect(calculateSum(0, 0)).toBe(0);
            expect(calculateSum(5, 0)).toBe(5);
            expect(calculateSum(0, 5)).toBe(5);
        });

        test('должна корректно работать с десятичными числами', () => {
            expect(calculateSum(1.5, 2.5)).toBe(4);
            expect(calculateSum(0.1, 0.2)).toBeCloseTo(0.3);
        });

        test('должна выбрасывать ошибку при неверных типах', () => {
            expect(() => calculateSum('2', 3)).toThrow('Оба параметра должны быть числами');
            expect(() => calculateSum(2, '3')).toThrow('Оба параметра должны быть числами');
            expect(() => calculateSum(null, 3)).toThrow('Оба параметра должны быть числами');
        });
    });

    describe('getGreeting', () => {
        test('должна возвращать приветственное сообщение', () => {
            const greeting = getGreeting();
            expect(greeting).toBe('Привет из DevOps Jenkins!');
            expect(typeof greeting).toBe('string');
        });
    });
});

