const init = require('../lib');
const {expect} = require('chai');

describe('"init"', () => {
    it('should export a function', () => {
        expect(init).to.be.a('function');
    });
});
