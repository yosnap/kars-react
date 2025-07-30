import { getLocalizedPath, getPathWithoutLanguage } from '../LanguageContext';

describe('LanguageContext', () => {

  describe('getLocalizedPath', () => {
    it('returns correct path for Spanish', () => {
      const result = getLocalizedPath('/vehicles', 'es');
      expect(result).toBe('/es/vehiculos');
    });

    it('returns correct path for English', () => {
      const result = getLocalizedPath('/taller', 'en');
      expect(result).toBe('/en/workshop');
    });

    it('returns correct path for French', () => {
      const result = getLocalizedPath('/favorits', 'fr');
      expect(result).toBe('/fr/favoris');
    });

    it('returns original path for Catalan (default)', () => {
      const result = getLocalizedPath('/vehicles', 'ca');
      expect(result).toBe('/vehicles');
    });

    it('preserves query parameters', () => {
      const result = getLocalizedPath('/vehicles?page=2', 'es');
      expect(result).toBe('/es/vehiculos?page=2');
    });
  });

  describe('getPathWithoutLanguage', () => {
    it('removes language prefix and translates to base route', () => {
      const result = getPathWithoutLanguage('/es/vehiculos');
      expect(result).toBe('/vehicles');
    });

    it('handles French routes correctly', () => {
      const result = getPathWithoutLanguage('/fr/vehicules');
      expect(result).toBe('/vehicles');
    });

    it('handles English routes correctly', () => {
      const result = getPathWithoutLanguage('/en/workshop');
      expect(result).toBe('/taller');
    });

    it('handles routes without language prefix', () => {
      const result = getPathWithoutLanguage('/vehicles');
      expect(result).toBe('/vehicles');
    });

    it('preserves query parameters', () => {
      const result = getPathWithoutLanguage('/es/vehiculos?page=2');
      expect(result).toBe('/vehicles?page=2');
    });
  });

  describe('favorites routes mapping', () => {
    it('maps Spanish favorites correctly', () => {
      const result = getLocalizedPath('/favorits', 'es');
      expect(result).toBe('/es/favoritos');
    });

    it('maps English favorites correctly', () => {
      const result = getLocalizedPath('/favorits', 'en');
      expect(result).toBe('/en/favorites');
    });

    it('maps French favorites correctly', () => {
      const result = getLocalizedPath('/favorits', 'fr');
      expect(result).toBe('/fr/favoris');
    });

    it('reverse maps Spanish favorites correctly', () => {
      const result = getPathWithoutLanguage('/es/favoritos');
      expect(result).toBe('/favorits');
    });

    it('reverse maps English favorites correctly', () => {
      const result = getPathWithoutLanguage('/en/favorites');
      expect(result).toBe('/favorits');
    });

    it('reverse maps French favorites correctly', () => {
      const result = getPathWithoutLanguage('/fr/favoris');
      expect(result).toBe('/favorits');
    });
  });
});