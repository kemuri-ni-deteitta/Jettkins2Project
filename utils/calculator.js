/**
 * Функция для вычисления суммы двух чисел
 * @param {number} a - Первое число
 * @param {number} b - Второе число
 * @returns {number} Сумма a и b
 */
function calculateSum(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Оба параметра должны быть числами');
    }
    return a + b;
}

/**
 * Функция для получения приветствия
 * @returns {string} Приветственное сообщение
 */
function getGreeting() {
    return 'CI/CD работает! Изменения применены автоматически!';
}

module.exports = {
    calculateSum,
    getGreeting
};

