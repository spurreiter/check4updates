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
    [['--major'], { major: true, minor: false, patch: false }],
    [['--minor'], { major: false, minor: true, patch: false }],
    [['--patch'], { major: false, minor: false, patch: true }],
    [['-x', 'one', 'two', 'three'], { exclude: ['one', 'two', 'three'] }],
    [['one', 'two', 'three'], { include: ['one', 'two', 'three'] }],
    [['--peer'], { peer: true }],
    [['--dev'], { dev: true }],
    [['--prod'], { prod: true }],
    [['--minor', '--prod', '-d', '/test', '--exclude', 'one'], {
      dirname: '/test',
      exclude: ['one'],
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
