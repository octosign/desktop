describe('Settings Screen', function() {
  it('Contains title', function() {
    cy.visit('/');

    cy.title().should('be', 'Octosign');

    cy.contains('Settings').click();

    cy.contains('Select files').should('not.exist');

    cy.contains('Settings');

    cy.title().should('be', 'Octosign');

    cy.percySnapshot();
  });

  it('Allows getting back to Main Screen', function() {
    cy.visit('/');

    cy.contains('Settings').click();

    cy.contains('Select files').should('not.exist');

    cy.contains('Close').click();

    cy.contains('Select files');
  });

  it('Contains list of backends with info', function() {
    cy.visit('/');

    cy.contains('Settings').click();

    cy.contains('Select files').should('not.exist');

    // First backend
    cy.contains('Advanced signature');
    cy.contains('Advanced electronic signature description');
    cy.contains('Version 0.1.0');
    cy.contains('Jakub Ďuraš');
    cy.contains('GNU LGPL v2.1');
    // TODO: Add checking link on the author
  });

  it('Contains settings for the backend', function() {
    cy.visit('/');

    cy.contains('Settings').click();

    cy.contains('Select files').should('not.exist');

    // TODO: Add checking for field that can be modified
  });
});
