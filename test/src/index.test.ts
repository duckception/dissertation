import { expect } from 'chai'
import { hello } from '../../src'

describe('hello', () => {
  it('works', () => {
    expect(hello()).to.eq('Hello world!')
  })
})
