// We need to add the path manually as in electron (default for headless) it is empty
// TODO: Find a better way or place for this
const createFile = name => {
  const realFile = new File(['123'], name, { lastModified: 1561032102 });
  const file = {};
  for (const name in realFile) {
    file[name] = realFile[name];
  }
  file.path = name;
  return file;
};
const testFile = createFile('filename.pdf');
const signedTestFile = createFile('signed.pdf');
const invalidTestFile = createFile('invalid.pdf');
const unsupportedFile = createFile('unsupported.pdf');

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
