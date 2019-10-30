'use strict';

let gsd = require('../gsd');

describe('Simple test cases', () => {
  let X = [];
  let Y = [];
  for (let i = 0; i < 10; i++) {
    X.push(X.length);
    Y.push(0);
  }
  for (let i = 0; i <= 10; i++) {
    X.push(X.length);
    Y.push(i > 5 ? 10 - i : i);
  }
  for (let i = 0; i < 10; i++) {
    X.push(X.length);
    Y.push(0);
  }

  it('gsd not realtop', () => {
    let peaks = gsd(X, Y, {
      realTopDetection: false,
      smoothY: true,
      sgOptions: {
        windowSize: 5,
        polynomial: 3,
      },
    });

    expect(peaks).toStrictEqual([
      {
        base: 1.1956287811760204,
        index: 15,
        soft: false,
        width: 2,
        x: 15,
        y: 4.657142857142857,
      },
    ]);
  });

  it('gsd not realtop asymetric', () => {
    let Y2 = Y.slice(0);
    Y2[14] = 5;
    let peaks = gsd(X, Y2, {
      realTopDetection: false,
      smoothY: true,
      sgOptions: {
        windowSize: 5,
        polynomial: 3,
      },
    });

    expect(peaks).toStrictEqual([
      {
        base: 1.2434539324230613,
        index: 15,
        soft: false,
        width: 3,
        x: 15,
        y: 5,
      },
    ]);
  });

  it('gsd realtop', () => {
    let Y2 = Y.slice();
    Y2[14] = 5;
    let peaks = gsd(X, Y2, {
      realTopDetection: true,
      smoothY: true,
      sgOptions: {
        windowSize: 5,
        polynomial: 3,
      },
    });

    expect(peaks).toStrictEqual([
      {
        base: 1.2434539324230613,
        index: 15,
        soft: false,
        width: 3,
        x: 14.755485084898725,
        y: 3.7914767697342637,
      },
    ]);
  });
});
