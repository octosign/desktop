<p align="center">
  <a href="https://octosign.com/">
    <img src="https://octosign.com/icon.svg" alt="Octosign logo" width="72" height="72">
  </a>
</p>

<h3 align="center">Octosign - desktop electronic signature software</h3>

<p align="center">
  Sign your document (PDF, JPG...) using an image, handwritten signature, or cryptography (PAdES, CAdES, XAdES).
  <br>
  <a href="https://octosign.com/download/"><strong>Download »</strong></a>
  <br>
  <br>
  <a href="https://github.com/durasj/octosign/issues/new?template=bug.md">Report bug</a>
  ·
  <a href="https://github.com/durasj/octosign/issues/new?template=feature.md">Request feature</a>
</p>

<p align="center">
  <a href="https://dev.azure.com/jkblmr/octosign/_build?definitionId=1&_a=summary"><img src="https://img.shields.io/azure-devops/build/jkblmr/b7d9a0c0-fcc7-4121-b1ad-d8c255769b04/1" alt="Azure Pipelines"></a>
  <a href="https://snyk.io/test/github/durasj/octosign"><img src="https://img.shields.io/snyk/vulnerabilities/github/durasj/octosign" alt="Known Vulnerabilities"></a>
  <a href="https://codeclimate.com/github/durasj/octosign"><img src="https://img.shields.io/codeclimate/maintainability/durasj/octosign" alt="Maintainability rating"></a>
  <a href="https://codecov.io/gh/durasj/octosign"><img src="https://img.shields.io/codecov/c/gh/durasj/octosign" alt="Unit test code coverage"></a>
</p>

## Table of contents

- [Features](#features)
- [Backends](#backends)
- [Development](#development)
- [Contributing](#contributing)
- [Thanks](#thanks)
- [Copyright and license](#copyright-and-license)

## Features

![Screenshot from the application](https://github.com/durasj/octosign/blob/master/res/screenshot.png?raw=true)

* Simple, straightforward interface (no technical details unless you want them).
* Ability to sign and verify document signatures.
* Sign a PDF using an image signature - picked from the computer or drawn in the application.
* Sign any file using the cryptography within the EU - using, depending on the country, for example, your eID.
* Localized in several languages and [open to new translations](https://www.transifex.com/jakub-duras/octosign/).
* Open for extension with new signature types ([Backends](#backends)).
* Available on all three major desktop platforms - Windows, macOS, and Linux.

## Backends

Backends do the actual document manipulation and are presented as signature type in the upper part of the application. They are simple CLI applications that communicate with the Electron application via [STDIO](https://en.wikipedia.org/wiki/Standard_streams). If you are interested in how this works, check the [Backend specification](https://github.com/durasj/octosign/wiki/Backend-specification). If you would like to create your own backend (it's quite simple to start!), check out the [How to create a backend](https://github.com/durasj/octosign/wiki/How-to-create-backend) guide.

Currently available backends (signature types):
* [DSS backend](https://github.com/durasj/octosign-dss) - Useful for people living within the EEA - uses [Digital Signature Service](https://github.com/esig/dss) from the EU.
* [Image backend](https://github.com/durasj/octosign-image) - Places image signature on the PDF - either drawn or picked from the computer.
* ... do you want to write your own backend? Check [How to create a backend](https://github.com/durasj/octosign/wiki/How-to-create-backend) guide.

## Development

Clone this repository including submodules: `git clone --recurse-submodules https://github.com/durasj/octosign.git`.

Then, assuming you have the latest LTS version of [Node.js](https://nodejs.org/) with npm installed, you just have to install the dependencies, run build, and start the application:

```shell
npm install
npm run build:backends -- --skip-failed
npm run build
npm start
```

Backends that couldn't be built will be skipped. This helps get the app up and running even if all backend-specific toolsets are not available (like JDK or Go). Those backends won't be available so you can fix your local ENV looking at the logged errors if you want.

## Contributing

You are more than welcome to submit your proposed changes. Please try to match the existing code style, include automated tests, and make sure your build passes.

## Thanks

- [Faculty of Science, P. J. Safarik University](https://www.upjs.sk/en/faculty-of-science/) - see my [thesis](https://thesis.science.upjs.sk/~jduras/draft.pdf).
- [Peter Vnuk](https://techguru.sk/) for Czech translation.
- Everybody who was kind enough to share their feedback.

## Copyright and license

Code and documentation copyright 2019 Jakub Duras. Released under the MIT License.
