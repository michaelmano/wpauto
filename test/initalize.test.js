require('babel-register');
import init from '../lib';
import {expect} from 'chai';

describe('"init"', () => {
    it('should export a function', () => {
        expect(init).to.be.a('function');
    });
});
