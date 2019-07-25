const assert = require('assert')
const { cli } = require('..')

describe('cli', function () {
  const tests = [
    [['--help'], { help: true }],
    [['-h'], { help: true }],
    [['-?'], { help: true }],
    [['--version'], { version: require('../package.json').version }],
    [['--dir', './test'], { dirname: __dirname }],
    [['-d', '/dir'], { dirname: '/dir' }],
    [['--quiet'], { quiet: true }],
    [['-q'], { quiet: true }],
    [['--update'], { update: true }],
    [['-u'], { update: true }],
    [['--max'], { latest: false, max: true, major: false, minor: false, patch: false }],
    [['--latest'], { latest: true, max: false, major: false, minor: false, patch: false }],
    [['--major'], { latest: false, max: false, major: true, minor: false, patch: false }],
    [['--minor'], { latest: false, max: false, major: false, minor: true, patch: false }],
    [['--patch'], { latest: false, max: false, major: false, minor: false, patch: true }],
    [['-x', 'one', 'two', 'three'], { exclude: ['one', 'two', 'three'] }],
    [['one', 'two', 'three'], { include: ['one', 'two', 'three'] }],
    [['--peer'], { peer: true }],
    [['--dev'], { dev: true }],
    [['--prod'], { prod: true }],
    [['--minor', '--prod', '-d', '/test', '--exclude', 'one'], {
      dirname: '/test',
      exclude: ['one'],
      latest: false,
      max: false,
      major: false,
      minor: true,
      patch: false,
      prod: true
    }]
  ]
  tests.forEach(test => {
    const [argv, exp] = test
    it(argv.join(' '), function () {
      const res = cli(argv)
      '_packages _exclude _include progressBar ttyout'.split(' ')
        .forEach(key => delete res[key])
      assert.deepStrictEqual(res, exp)
    })
  })
})
