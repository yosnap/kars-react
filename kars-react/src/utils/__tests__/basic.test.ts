// Basic test to verify Jest is working
describe('Basic Jest functionality', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello World';
    expect(greeting).toContain('World');
    expect(greeting.length).toBe(11);
  });

  it('should handle array operations', () => {
    const languages = ['ca', 'es', 'en', 'fr'];
    expect(languages).toHaveLength(4);
    expect(languages).toContain('ca');
    expect(languages[0]).toBe('ca');
  });

  it('should handle object operations', () => {
    const config = {
      defaultLanguage: 'ca',
      supportedLanguages: ['ca', 'es', 'en', 'fr']
    };
    
    expect(config.defaultLanguage).toBe('ca');
    expect(config.supportedLanguages).toHaveLength(4);
    expect(config).toHaveProperty('defaultLanguage');
  });
});