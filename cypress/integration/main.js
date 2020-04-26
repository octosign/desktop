const testFile = new File(['123'], 'filename.pdf', { lastModified: 1 });

describe('Main Screen', function () {
  it('Contains intro text, file selection controls, links and logo', function () {
    cy.visit('/');

    cy.title().should('be', 'Octosign');

    cy.contains('Sign a new document');

    cy.contains('Select files');
    cy.contains('or drag and drop your files anywhere');

    cy.contains('Help');
    cy.contains('Settings');

    cy.percySnapshot();
  });

  it('Navigates to octosign.com on logo and help', function () {
    cy.visit('/');

    cy.get('img[alt="Logo"]')
      .closest('a')
      .should('have.attr', 'target', 'blank')
      .should('have.attr', 'href')
      .and('contain', 'octosign.com');

    cy.contains('Help')
      .should('have.attr', 'target', 'blank')
      .should('have.attr', 'href')
      .and('contain', 'octosign.com/help');
  });

  it('Allows selecting file by drag and drop', function () {
    cy.visit('/');

    cy.contains('Sign a new document');

    cy.contains('Sign a new document').trigger('dragenter', {
      force: true,
      dataTransfer: { files: [testFile], types: ['Files'] },
    });

    cy.contains('Drop your files here');

    cy.percySnapshot('Main Screen Allows selecting file by drag and drop - over');

    cy.contains('Drop your files here').trigger('drop', {
      force: true,
      dataTransfer: { files: [testFile], types: ['Files'] },
    });

    cy.contains('filename');
    cy.contains('Unsigned');
    cy.contains('Size: 3 B');
    cy.contains('Last modified: 01/01/1970');

    cy.percySnapshot('Main Screen Allows selecting file by drag and drop - drop');
  });

  it('Allows selecting file by clicking anywhere and on the button', function () {
    cy.visit('/');

    cy.get('input[type="file"]').then(el => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(testFile);
      el[0].files = dataTransfer.files;
      cy.wrap(el).trigger('change', { force: true });
    });

    cy.contains('filename');
    cy.contains('Unsigned');
    cy.contains('Size: 3 B');
    cy.contains('Last modified: 01/01/1970');
  });

  it('Opens Settings screen from footer');
});
