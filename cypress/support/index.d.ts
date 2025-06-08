declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to login once per spec file.
     */
    login(): Chainable<void>;
  }
}
