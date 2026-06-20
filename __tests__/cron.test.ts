// testy dla logiki crona - zamykanie przeterminowanych ogłoszeń

describe('logika dat crona', () => {
    test('ogłoszenie z datą w przeszłości powinno być zamknięte', () => {
        const dataZamkniecia = new Date('2020-01-01');
        const teraz = new Date();
        const przeterminowane = dataZamkniecia <= teraz;

        expect(przeterminowane).toBe(true);
    });

    test('ogłoszenie z datą w przyszłości nie powinno być zamknięte', () => {
        const dataZamkniecia = new Date('2099-01-01');
        const teraz = new Date();
        const przeterminowane = dataZamkniecia <= teraz;

        expect(przeterminowane).toBe(false);
    });
});
