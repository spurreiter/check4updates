const chalk = require('chalk')
const { colorVersion, ttyout } = require('../src/ttyout.js')

describe('#ttyout', function () {
  describe('colorVersion', function () {
    chalk.default = chalk
    ;[
      { color: 'red', range: '^1.0.0', version: '4.0.0', wildcard: '~' },
      { color: 'red', range: '^1.0.0', version: '1.2.3-beta.0', wildcard: '^' },
      { color: 'red', range: '1.0.x', version: '1.2.3', wildcard: '^' },
      { color: 'cyan', range: '^1.0.0', version: '1.2.3', wildcard: '^' },
      { color: 'cyan', range: '^1.0.0', version: '1.2.3', wildcard: '^' },
      { color: 'cyan', range: '1.x', version: '1.2.3', wildcard: '^' },
      { color: 'cyan', range: '1.x.0', version: '1.2.3', wildcard: '^' },
      { color: 'green', range: '~1.0.0', version: '1.0.1', wildcard: '~' },
      { color: 'green', range: '1.0.x', version: '1.0.1', wildcard: '~' },
      { color: 'default', range: '*', version: '1.2.3', wildcard: '^' },
      { color: 'default', range: '^1.0.0-0', version: '1.0.0', wildcard: '^' },
      { color: 'default', range: '2.1.x', version: '2.1.0', wildcard: '~' }
    ].forEach((test) => {
      const { color, range, version, wildcard } = test
      // just visual tests
      it(`${range} \u{2192} ${chalk[color](wildcard + version)}`, () => {
        console.log(colorVersion(version, range, wildcard))
      })
    })
  })
  describe('ttyout', function () {
    const results = [
      {
        package: 'do-not-display',
        range: '^1.0.0',
        wildcard: '^',
        max: '1.0.0',
        major: '1.0.0',
        minor: '1.0.0',
        patch: '1.0.0'
      },
      {
        package: 'a-awesome-package',
        range: '^1.0.0',
        wildcard: '^',
        max: '1.9.0',
        major: '1.9.0',
        minor: '1.0.5',
        patch: '1.0.5'
      },
      {
        package: '@a-large-scope-with/a-large-package-name',
        range: '^1.0.0',
        wildcard: '^',
        max: '6.0.0',
        major: '1.5.0',
        minor: '1.0.5',
        patch: '1.0.5'
      },
      {
        package: 'strange-ranges',
        range: '>1.0.3 <2.1.0 || >=5.0.0 <7.0.0',
        wildcard: '^',
        max: '6.0.0',
        major: '1.5.0',
        minor: '1.0.5',
        patch: '1.0.5'
      },
      {
        package: '@test/test',
        range: '^1.2.0',
        error: new Error(
          'fatal: unable to access ' +
            "'https://github.com/test/test%2Ftest.git/'" +
            ': The requested URL returned error: 400'
        )
      },
      {
        package: '@spurreiter/not-there',
        range: '>1.0.3 <2.1.0',
        error: new Error(
          '404 Not Found - GET ' +
            'https://registry.npmjs.org/@spurreiter%2fnot-there ' +
            '- Not found'
        )
      }
    ]
    // just visual tests
    it('shall return "max" results', function () {
      console.log(ttyout()({ results, type: 'max' }))
    })
  })
})
