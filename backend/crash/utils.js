export function generateCrashPoint() {
    // Пример с эксп. распределением
    const r = Math.random();
    return Math.max(1.0, 1.1 + -Math.log(1 - r) * 1.5); // чаще < 3.0
}
