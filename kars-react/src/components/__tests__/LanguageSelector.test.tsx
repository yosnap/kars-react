// Simple test to verify LanguageSelector module loads correctly
describe('LanguageSelector', () => {
  it('should import LanguageSelector without errors', () => {
    const LanguageSelector = require('../LanguageSelector').default;
    expect(typeof LanguageSelector).toBe('function');
  });
});