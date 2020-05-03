describe('Settings Screen', function () {
  it('Can be opened and closed', function () {
    cy.visit('/');

    cy.get('[data-cy=settings]').should('not.be.visible');

    cy.contains('Settings').click();

    cy.get('[data-cy=settings]').should('be.visible');

    cy.contains('Close').should('be.visible');

    cy.get('[data-cy=settings]')
      .contains('Settings')
      .should('be.visible')
      .should('have.prop', 'tagName')
      .should('eq', 'H2');

    cy.contains('Simple image signature');

    cy.percySnapshot();

    cy.contains('Close').click();

    cy.get('[data-cy=settings]').should('not.be.visible');
  });

  it('Contains general info and language select', function () {
    cy.visit('/');
    cy.contains('Settings').click();

    cy.contains('Octosign v0.3.0-dev');
    cy.contains('General');
    cy.contains('Language');
  });

  it('Contains list of backends with info', function () {
    cy.visit('/');
    cy.contains('Settings').click();

    // First backend
    cy.contains('Advanced electronic signature');
    cy.contains('Advanced electronic signature usable on PDF');
    cy.contains('v0.1.0 by Jakub Ďuraš (jakub@duras.me)');
    cy.contains('Licensed under GNU Lesser General Public License v2.1.');
    cy.contains('Source code available at repository.');
    // TODO: Add check for the repository link.

    // Second backend
    cy.contains('Simple image signature');
    cy.contains('Signs PDFs using chosen image');
    cy.contains('v0.2.0 (duras.me)');
  });

  it('Contains settings for the backend', function () {
    cy.visit('/');

    cy.contains('Settings').click();

    cy.contains('PKCS #11 Library Path')
      .closest('div')
      .find('input')
      .should('have.value', 'dll/path.dll')
      .clear()
      .type('different/path.dll')
      .should('have.value', 'different/path.dll');
  });
});
