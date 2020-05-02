const testFile = new File(['123'], 'filename.pdf', { lastModified: 1 });
const signedTestFile = new File(['123'], 'signed.pdf', { lastModified: 1 });
const invalidTestFile = new File(['123'], 'invalid.pdf', { lastModified: 1 });
const unsupportedFile = new File(['123'], 'unsupported.jpg', { lastModified: 1 });

describe('Card with file', function () {
  it('Verifies and shows picked file status', function () {
    cy.visit('/');

    cy.contains('Sign a new document').trigger('drop', {
      force: true,
      dataTransfer: { files: [signedTestFile], types: ['Files'] },
    });

    cy.contains('Verifying...');

    cy.contains('Signed');
  });

  it('Allows to sign file', function () {
    cy.visit('/');

    cy.contains('Sign a new document').trigger('drop', {
      force: true,
      dataTransfer: { files: [testFile], types: ['Files'] },
    });

    cy.contains('Verifying...');

    cy.contains('Unknown');

    cy.contains('Sign').click();

    cy.contains('Signing...');
    cy.contains('Verifying...');

    cy.contains('Unknown');
  });

  it('Does not allow to sign unsupported file', function () {
    cy.visit('/');

    cy.contains('Sign a new document').trigger('drop', {
      force: true,
      dataTransfer: { files: [unsupportedFile], types: ['Files'] },
    });

    cy.contains('Verifying...');

    cy.contains('Unknown');

    cy.contains('Sign').should('be', 'disabled');
  });

  it('Shows file details if available', function () {
    cy.visit('/');

    cy.contains('Sign a new document').trigger('drop', {
      force: true,
      dataTransfer: { files: [invalidTestFile], types: ['Files'] },
    });

    cy.contains('Invalid');

    cy.contains('Open signature details').click();

    cy.contains('Signature details');
    cy.contains('Some invalid details');
  });

  it.skip('TODO: Does not allow to sign during signing or verification');
});
