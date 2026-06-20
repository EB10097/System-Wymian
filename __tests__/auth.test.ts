import bcrypt from 'bcryptjs';

describe('bcrypt - hashowanie haseł', () => {
    test('hash nie może być taki sam jak oryginalne hasło', async () => {
        const haslo = 'mojeTajneHaslo123';
        const hash = await bcrypt.hash(haslo, 10);

        expect(hash).not.toBe(haslo);
        expect(hash.length).toBeGreaterThan(0);
    });

    test('compare powinno zwrócić true dla dobrego hasła i false dla złego', async () => {
        const haslo = 'poprawneHaslo456';
        const hash = await bcrypt.hash(haslo, 10);

        const poprawne = await bcrypt.compare(haslo, hash);
        const bledne = await bcrypt.compare('zleHaslo', hash);

        expect(poprawne).toBe(true);
        expect(bledne).toBe(false);
    });
});
