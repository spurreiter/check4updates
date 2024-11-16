const assert = require('assert')
const { incexc } = require('../src/incexc.js')

const log = require('debug')('test:incexc')

describe('incexc', function () {
  const packages = {
    a: '1',
    b: '2',
    c: '3',
    d: '4'
  }

  it('shall pass through', function () {
    const res = incexc({
      packages
    })
    log(res)
    assert.deepStrictEqual(res, {
      a: '1',
      b: '2',
      c: '3',
      d: '4'
    })
  })
  it('shall include', function () {
    const res = incexc({
      packages,
      include: ['a', 'c', 'e']
    })
    log(res)
    assert.deepStrictEqual(res, {
      a: '1',
      c: '3'
    })
  })
  it('shall exclude', function () {
    const res = incexc({
      packages,
      exclude: ['a', 'c', 'e']
    })
    log(res)
    assert.deepStrictEqual(res, {
      b: '2',
      d: '4'
    })
  })
  it('shall include/exclude', function () {
    const res = incexc({
      packages,
      include: ['b', 'c'],
      exclude: ['a', 'c', 'e']
    })
    log(res)
    assert.deepStrictEqual(res, {
      b: '2'
    })
  })
  it('shall filter', function () {
    const res = incexc({
      packages,
      filter: /b|c/i
    })
    log(res)
    assert.deepStrictEqual(res, {
      b: '2',
      c: '3'
    })
  })
  it('shall filter inverse', function () {
    const res = incexc({
      packages,
      filterInv: /b|c/i
    })
    log(res)
    assert.deepStrictEqual(res, {
      a: '1',
      d: '4'
    })
  })
  it('shall filter combined', function () {
    const res = incexc({
      packages,
      filter: /a|b/i,
      filterInv: /b|c/i
    })
    log(res)
    assert.deepStrictEqual(res, {
      a: '1'
    })
  })
})
