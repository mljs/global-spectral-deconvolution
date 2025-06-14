# Changelog

## [13.0.1](https://github.com/mljs/global-spectral-deconvolution/compare/v13.0.0...v13.0.1) (2025-06-13)


### Bug Fixes

* cleanup package and remove uuid generator package ([#129](https://github.com/mljs/global-spectral-deconvolution/issues/129)) ([a89e945](https://github.com/mljs/global-spectral-deconvolution/commit/a89e945978f2426e9b70ee6e3a1ee2221cf60713))

## [13.0.0](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.8...v13.0.0) (2025-06-13)


### ⚠ BREAKING CHANGES

* switch to esm-only and update to `ml-spectra-fitting@5` ([#127](https://github.com/mljs/global-spectral-deconvolution/issues/127))

### Code Refactoring

* switch to esm-only and update to `ml-spectra-fitting@5` ([#127](https://github.com/mljs/global-spectral-deconvolution/issues/127)) ([170d023](https://github.com/mljs/global-spectral-deconvolution/commit/170d023f53aed10800f3d24068e1e1574fff6632))

## [12.1.8](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.7...v12.1.8) (2024-09-27)


### Bug Fixes

* tsbuild ([23c1c53](https://github.com/mljs/global-spectral-deconvolution/commit/23c1c53757c646c52922900e8ec5e7c3fd24fb32))

## [12.1.7](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.6...v12.1.7) (2024-09-26)


### Bug Fixes

* generalized lorentzian as a new shape ([#122](https://github.com/mljs/global-spectral-deconvolution/issues/122)) ([26a22da](https://github.com/mljs/global-spectral-deconvolution/commit/26a22da865db9f3173d4f37da09537792971ca72))

## [12.1.6](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.5...v12.1.6) (2024-03-09)


### Bug Fixes

* keep peaks if broad shape does not match well ([#120](https://github.com/mljs/global-spectral-deconvolution/issues/120)) ([1152b67](https://github.com/mljs/global-spectral-deconvolution/commit/1152b67e37bfcab11db150aac16e23539d1051c0))

## [12.1.5](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.4...v12.1.5) (2024-03-07)


### Bug Fixes

* update ml-spectra-processing and dependencies ([8b646d9](https://github.com/mljs/global-spectral-deconvolution/commit/8b646d91ba7ccf970f51dcb7dc6476635fcda3d4))

## [12.1.4](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.3...v12.1.4) (2024-03-06)


### Bug Fixes

* fix new width in broad singlet peak ([#117](https://github.com/mljs/global-spectral-deconvolution/issues/117)) ([79eb832](https://github.com/mljs/global-spectral-deconvolution/commit/79eb832c78b7503a447dd8061d63ec9872eb0aca))

## [12.1.3](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.2...v12.1.3) (2023-03-24)


### Bug Fixes

* update dependencies ([01f862e](https://github.com/mljs/global-spectral-deconvolution/commit/01f862e311ad5d9ad8a562b5670c81a79f803e6d))

## [12.1.2](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.1...v12.1.2) (2022-09-22)


### Bug Fixes

* remove shape from type definitions ([#114](https://github.com/mljs/global-spectral-deconvolution/issues/114)) ([ea30120](https://github.com/mljs/global-spectral-deconvolution/commit/ea301202e0a011581790eb390ab91012f1eee3ef))

## [12.1.1](https://github.com/mljs/global-spectral-deconvolution/compare/v12.1.0...v12.1.1) (2022-09-21)


### Bug Fixes

* remove shape from gsd peaks ([#111](https://github.com/mljs/global-spectral-deconvolution/issues/111)) ([926ca69](https://github.com/mljs/global-spectral-deconvolution/commit/926ca69f130f3bda4bc63de8827660de082fe95d))

## [12.1.0](https://github.com/mljs/global-spectral-deconvolution/compare/v12.0.0...v12.1.0) (2022-08-27)


### Features

* peak picking returns id and keep id if it exists ([#108](https://github.com/mljs/global-spectral-deconvolution/issues/108)) ([f22f5a5](https://github.com/mljs/global-spectral-deconvolution/commit/f22f5a5f3077aa86f2efbd3e9eb8cbab92ba416b))

## [12.0.0](https://github.com/mljs/global-spectral-deconvolution/compare/v11.3.0...v12.0.0) (2022-08-06)


### ⚠ BREAKING CHANGES

* add setShape n addMissingShape function

### Features

* add setShape n addMissingShape function ([a939d0c](https://github.com/mljs/global-spectral-deconvolution/commit/a939d0c5ad99a19f426847558268d5caa154e1c8)), closes [#104](https://github.com/mljs/global-spectral-deconvolution/issues/104)

## [11.3.0](https://github.com/mljs/global-spectral-deconvolution/compare/v11.2.1...v11.3.0) (2022-08-05)


### Features

* add shape to gsd result ([#102](https://github.com/mljs/global-spectral-deconvolution/issues/102)) ([505121d](https://github.com/mljs/global-spectral-deconvolution/commit/505121d79a32fafa6fd49ab633556983b1cef24c))

### [11.2.1](https://github.com/mljs/global-spectral-deconvolution/compare/v11.2.0...v11.2.1) (2022-05-06)


### Bug Fixes

* remove circular dependency ([d73b0ae](https://github.com/mljs/global-spectral-deconvolution/commit/d73b0ae3d70671164ff186a2924a6b051846208c))
* still allow node 12 compatibility ([394870e](https://github.com/mljs/global-spectral-deconvolution/commit/394870e5154eaa4e4252fe99e7ffca76d7e9eaed))

## [11.2.0](https://github.com/mljs/global-spectral-deconvolution/compare/v11.1.0...v11.2.0) (2022-05-03)


### Features

* add range in logs of optimization ([4e1c5d0](https://github.com/mljs/global-spectral-deconvolution/commit/4e1c5d05920f10404a6da1e08af9c0cb770ec71f))

## [11.1.0](https://github.com/mljs/global-spectral-deconvolution/compare/v11.0.0...v11.1.0) (2022-05-03)


### Features

* add optimizePeaksWithLogs to be able to debug ([4e7848b](https://github.com/mljs/global-spectral-deconvolution/commit/4e7848b37ed8280275f76d56dd5d35c860074542))


### Bug Fixes

* fwhm didn't work for pseudovoigt ([9b8e0b6](https://github.com/mljs/global-spectral-deconvolution/commit/9b8e0b6f9dfe9e3f396522b35d961315ef5f0e90))

## [11.0.0](https://github.com/mljs/global-spectral-deconvolution/compare/v10.2.0...v11.0.0) (2022-05-02)


### ⚠ BREAKING CHANGES

* Move property fwhm to be into 'shape'. This ensure compability with our other packages.

### Miscellaneous Chores

* update dependencies ([#96](https://github.com/mljs/global-spectral-deconvolution/issues/96)) ([d8bd3e7](https://github.com/mljs/global-spectral-deconvolution/commit/d8bd3e7b9ec45c6e21459405b8b64fee058dbc99))

## [10.2.0](https://github.com/mljs/global-spectral-deconvolution/compare/v10.1.2...v10.2.0) (2022-03-09)


### Features

* when broadening overlaping peaks the middle is proportional to the width ([8bf8838](https://github.com/mljs/global-spectral-deconvolution/commit/8bf8838cde1dab73b86b0e7f97daf67875c20ae2))

### [10.1.2](https://www.github.com/mljs/global-spectral-deconvolution/compare/v10.1.1...v10.1.2) (2022-02-25)


### Bug Fixes

* update dependencies ([924e5b7](https://www.github.com/mljs/global-spectral-deconvolution/commit/924e5b709efe8f919711310bb0a21e1a12dca227))

### [10.1.1](https://www.github.com/mljs/global-spectral-deconvolution/compare/v10.1.0...v10.1.1) (2022-02-22)


### Bug Fixes

* joinBroadPeaks n types ([#91](https://www.github.com/mljs/global-spectral-deconvolution/issues/91)) ([0b1b867](https://www.github.com/mljs/global-spectral-deconvolution/commit/0b1b86771770d8dbe3fe9ac8fb5fa6d3fbe39bc4))
* refactor joinBroadPeaks ([#87](https://www.github.com/mljs/global-spectral-deconvolution/issues/87)) ([e7c7785](https://www.github.com/mljs/global-spectral-deconvolution/commit/e7c7785433c09eb3357b567f8f459dbf2d7bb5e0))

## [10.1.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v10.0.0...v10.1.0) (2022-02-15)


### Features

* reintroduce an improved noiseLevel option ([d8d646a](https://www.github.com/mljs/global-spectral-deconvolution/commit/d8d646a5cd2c1ab68ae6ccc97fc4d4dd4ea21c3d))


### Bug Fixes

* export typescript interface for GSDPeak, etc. ([2967ef5](https://www.github.com/mljs/global-spectral-deconvolution/commit/2967ef5126e5bcec38ec37ec7712a2749aa1f398))

## [10.0.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v9.1.0...v10.0.0) (2022-02-14)


### ⚠ BREAKING CHANGES

* major refactoring

### Features

* major refactoring ([42a54fb](https://www.github.com/mljs/global-spectral-deconvolution/commit/42a54fbd907055d233b9b43c85344823f3551bad))


### Bug Fixes

* update dependencies and fix is-any-array of spectra-processing ([8dbae56](https://www.github.com/mljs/global-spectral-deconvolution/commit/8dbae56cac1f6921dfc8ec57374d8c9df7776f96))

## [9.1.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v9.0.4...v9.1.0) (2021-12-15)


### Features

* remove circular dependency lf ml-gsd through ml-spectra-processing ([88a6c9e](https://www.github.com/mljs/global-spectral-deconvolution/commit/88a6c9e0da564ea5e67d932290b48a3dbcea0d1a))

### [9.0.4](https://www.github.com/mljs/global-spectral-deconvolution/compare/v9.0.3...v9.0.4) (2021-12-01)


### Bug Fixes

* update dependencies to have ts definition ([d2899b2](https://www.github.com/mljs/global-spectral-deconvolution/commit/d2899b275ed9dbb9c191b7392e012741025afda9))

### [9.0.3](https://www.github.com/mljs/global-spectral-deconvolution/compare/v9.0.2...v9.0.3) (2021-11-30)


### Bug Fixes

* remove I from interfaces ([f9c5171](https://www.github.com/mljs/global-spectral-deconvolution/commit/f9c5171b688fe4f1c33bbd75dce6d9387b828462))

### [9.0.2](https://www.github.com/mljs/global-spectral-deconvolution/compare/v9.0.1...v9.0.2) (2021-11-29)


### Bug Fixes

* eslint and update workflows ([81ffdff](https://www.github.com/mljs/global-spectral-deconvolution/commit/81ffdfffa49f114b93fd52218d8eef159bb2946a))
* update ml-peak-shape-generator to 4.0.1 ([ed2b98a](https://www.github.com/mljs/global-spectral-deconvolution/commit/ed2b98a7f6ae5fcff395a18e5f18a99321a0ed7b))

### [9.0.1](https://www.github.com/mljs/global-spectral-deconvolution/compare/v9.0.0...v9.0.1) (2021-11-23)


### Bug Fixes

* update PSG n spectra-fitting ([#70](https://www.github.com/mljs/global-spectral-deconvolution/issues/70)) ([ac23217](https://www.github.com/mljs/global-spectral-deconvolution/commit/ac23217cc1c73f513b772661ad2712b727fa02e7))

## [9.0.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v8.0.0...v9.0.0) (2021-11-18)


### ⚠ BREAKING CHANGES

* change peak shape structure (#68)

### Features

* change peak shape structure ([#68](https://www.github.com/mljs/global-spectral-deconvolution/issues/68)) ([f97285c](https://www.github.com/mljs/global-spectral-deconvolution/commit/f97285c139ea424fbb9bf037b51cf78ec12e0653))

## [8.0.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v7.0.1...v8.0.0) (2021-10-31)


### ⚠ BREAKING CHANGES

* setup typescript (#66)

### Features

* setup typescript ([#66](https://www.github.com/mljs/global-spectral-deconvolution/issues/66)) ([4e61017](https://www.github.com/mljs/global-spectral-deconvolution/commit/4e610172b9ebd36f232f2b99585e8c2481b78502))

### [7.0.1](https://www.github.com/mljs/global-spectral-deconvolution/compare/v7.0.0...v7.0.1) (2021-10-11)

### Bug Fixes

- remove type definition file ([efea5e2](https://www.github.com/mljs/global-spectral-deconvolution/commit/efea5e2443a7fd1298a4d4ba6fa5e6ab70bbe53b))

## [7.0.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.9.2...v7.0.0) (2021-10-11)

### ⚠ BREAKING CHANGES

- homogenize and generalize output (#63)

### Features

- homogenize and generalize output ([#63](https://www.github.com/mljs/global-spectral-deconvolution/issues/63)) ([2b3a403](https://www.github.com/mljs/global-spectral-deconvolution/commit/2b3a403747a8d83effb5bef8053863382d608546))

### [6.9.2](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.9.1...v6.9.2) (2021-10-07)

### Bug Fixes

- GSDPeak index rather than ndex ([da4dfd3](https://www.github.com/mljs/global-spectral-deconvolution/commit/da4dfd32192d8aca72501a252d43ecbaf0a61f14))

### [6.9.1](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.9.0...v6.9.1) (2021-10-07)

### Bug Fixes

- wrong search replace yield bad typescript definition ([fcfc3c6](https://www.github.com/mljs/global-spectral-deconvolution/commit/fcfc3c69b7f31058dae73005dca6ba6f672bdcff))

## [6.9.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.8.2...v6.9.0) (2021-10-05)

### Features

- fix and improve type script definition ([e3148cd](https://www.github.com/mljs/global-spectral-deconvolution/commit/e3148cdc7989fcb17c11c0fceb6eda1710f2e497))
- improve typescript definition ([3c772f7](https://www.github.com/mljs/global-spectral-deconvolution/commit/3c772f76dc3476e72f2f297a746fb314a0b5e609))

### Bug Fixes

- update dependencies and fix build ([48b4f41](https://www.github.com/mljs/global-spectral-deconvolution/commit/48b4f41e41db29fb21e54a86a1aeb02aa930aea0))

### [6.8.2](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.8.1...v6.8.2) (2021-09-29)

### Bug Fixes

- make optional option for GSD ([d3657de](https://www.github.com/mljs/global-spectral-deconvolution/commit/d3657de8fb407043890e899494a221b862c30973))

### [6.8.1](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.8.0...v6.8.1) (2021-09-29)

### Bug Fixes

- add types in files ([28f9dcb](https://www.github.com/mljs/global-spectral-deconvolution/commit/28f9dcb1425c8d7b9940c333c6cf123834a8ab7e))

## [6.8.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.7.0...v6.8.0) (2021-09-23)

### Features

- add types ([#55](https://www.github.com/mljs/global-spectral-deconvolution/issues/55)) ([d4f1564](https://www.github.com/mljs/global-spectral-deconvolution/commit/d4f15649572c0ec2f1142f4b3ed77655fca05a73))

## [6.7.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.6.3...v6.7.0) (2021-08-10)

### Features

- update ml-peak-shape-generator to 2.0.1 ([98128b8](https://www.github.com/mljs/global-spectral-deconvolution/commit/98128b85ea08bc1c9a3ebbecf4ddc2fca0b3e3b3))

### [6.6.3](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.6.2...v6.6.3) (2021-06-18)

### Bug Fixes

- maxCriteria=false gives more consistent results ([2652ec2](https://www.github.com/mljs/global-spectral-deconvolution/commit/2652ec265193207ff128348c8d0207d74e1b0c0c))

### [6.6.2](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.6.1...v6.6.2) (2021-05-11)

### Bug Fixes

- update dependencies ([4d9feac](https://www.github.com/mljs/global-spectral-deconvolution/commit/4d9feace7ffb106b68a7604df13e458f4474bc65))

### [6.6.1](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.6.0...v6.6.1) (2021-03-24)

### Bug Fixes

- update dependencies ([bf6ee4b](https://www.github.com/mljs/global-spectral-deconvolution/commit/bf6ee4b246e4d964945b034b6b430aa576caaded))

## [6.6.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.5.0...v6.6.0) (2021-01-21)

### Features

- update ml-spectra-fitting to 0.13.0 ([2b4f119](https://www.github.com/mljs/global-spectral-deconvolution/commit/2b4f119ce747208f1045b0a6ddc93b9b9bfbbe15))

## [6.5.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.4.0...v6.5.0) (2021-01-13)

### Features

- update spectra-fitting ([03205a3](https://www.github.com/mljs/global-spectral-deconvolution/commit/03205a3d570d87f35d96dbe674ddb67b0f236564))

## [6.4.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.3.0...v6.4.0) (2020-12-21)

### Features

- added timeout option to avoid long executions. close [#37](https://www.github.com/mljs/global-spectral-deconvolution/issues/37) ([#47](https://www.github.com/mljs/global-spectral-deconvolution/issues/47)) ([b847438](https://www.github.com/mljs/global-spectral-deconvolution/commit/b8474381e9ccfef543251ffe2ea0d2afc1815eb7))

## [6.3.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.2.0...v6.3.0) (2020-12-13)

### Features

- update ml-peak-shape-generator ([9d446a9](https://www.github.com/mljs/global-spectral-deconvolution/commit/9d446a9993d360c2001cbb23e782b6b881b1f47e))
- update ml-peak-shape-generator ([#44](https://www.github.com/mljs/global-spectral-deconvolution/issues/44)) ([70776d3](https://www.github.com/mljs/global-spectral-deconvolution/commit/70776d3a45b7e25296203ae5cfc8d89c3679d258))

## [6.2.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.1.2...v6.2.0) (2020-12-05)

### Features

- add factorLimits parameter for optimizePeaks ([1af47e1](https://www.github.com/mljs/global-spectral-deconvolution/commit/1af47e1a32cfef957cc43078ae389ecc4f2d691b))
- add failling test case ([a061013](https://www.github.com/mljs/global-spectral-deconvolution/commit/a06101315d97e70bc19119dad3692eff64848568))
- improve groupPeaks ([6ef7024](https://www.github.com/mljs/global-spectral-deconvolution/commit/6ef7024a1e34ce63c71fa0679946df74271d3c88))
- simplify optimizePeaks ([3abfe93](https://www.github.com/mljs/global-spectral-deconvolution/commit/3abfe93a4cc938d799acc495fea959d15db272a3))
- update ml-spectra-fitting ([97899d5](https://www.github.com/mljs/global-spectral-deconvolution/commit/97899d5f3453d6f0b0a4afa0c8102b07c5d69a32))

### Bug Fixes

- always ascending order in x dimension ([6ffc64f](https://www.github.com/mljs/global-spectral-deconvolution/commit/6ffc64f288220f4d004b7627c2fb44caa9b21bbf))
- update dependencies ([5ea4c7f](https://www.github.com/mljs/global-spectral-deconvolution/commit/5ea4c7fbb042c2145e760b97aab6c92788eeb117))

### [6.1.2](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.1.1...v6.1.2) (2020-11-18)

### Bug Fixes

- method name in README ([cb0e563](https://www.github.com/mljs/global-spectral-deconvolution/commit/cb0e563b5eeaee233004fdcd87882b470654bd99))

### [6.1.1](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.1.0...v6.1.1) (2020-11-14)

### Bug Fixes

- update spectra-fitting ([33d89df](https://www.github.com/mljs/global-spectral-deconvolution/commit/33d89dfba443e5b2080e51e9f265305301f8409a))

## [6.1.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v6.0.0...v6.1.0) (2020-11-13)

### Features

- change factorWidth from 4 to 1 ([3de56ae](https://www.github.com/mljs/global-spectral-deconvolution/commit/3de56ae345322446b0bafa1d020bf6fdff0ff5ee))
- update spectra-fitting package ([#33](https://www.github.com/mljs/global-spectral-deconvolution/issues/33)) ([e62e27b](https://www.github.com/mljs/global-spectral-deconvolution/commit/e62e27b0aeb527878af9240b367fee951ba7a889))

### Bug Fixes

- fix docs for optimize ([96ea711](https://www.github.com/mljs/global-spectral-deconvolution/commit/96ea71123f4989308bf060dc5108c24e55baaab5))
- improve speed by not predefining arrays length ([e03737c](https://www.github.com/mljs/global-spectral-deconvolution/commit/e03737c42ae097d1c8ddec7303613ea87cec955c))

## [6.0.0](https://www.github.com/mljs/global-spectral-deconvolution/compare/v5.0.2...v6.0.0) (2020-11-06)

### ⚠ BREAKING CHANGES

- Remove compatibility with node 8

### Features

- change parameters ([4653e16](https://www.github.com/mljs/global-spectral-deconvolution/commit/4653e164ab5181e5d65a443dec043934aae3d01e))

### Miscellaneous Chores

- update travis ([3120a4a](https://www.github.com/mljs/global-spectral-deconvolution/commit/3120a4a673d4d1826e92c3073a7803eef07b8d4b))

# [5.0.0](https://github.com/mljs/global-spectral-deconvolution/compare/v4.0.0...v5.0.0) (2020-05-19)

# [4.0.0](https://github.com/mljs/global-spectral-deconvolution/compare/v3.0.1...v4.0.0) (2020-03-20)

### Features

- broadenPeaks takes into account the inflection points if available ([d9302c7](https://github.com/mljs/global-spectral-deconvolution/commit/d9302c74a937f1202dc0898b0ca86bf684edf2c2))

## [3.0.1](https://github.com/mljs/global-spectral-deconvolution/compare/v3.0.0...v3.0.1) (2020-02-28)

# [3.0.0](https://github.com/mljs/global-spectral-deconvolution/compare/v2.0.6...v3.0.0) (2020-02-27)

## [2.0.5](https://github.com/mljs/global-spectral-deconvolution/compare/v2.0.4...v2.0.5) (2019-01-09)

## [2.0.4](https://github.com/mljs/global-spectral-deconvolution/compare/v2.0.3...v2.0.4) (2019-01-09)

<a name="2.0.3"></a>

## [2.0.3](https://github.com/mljs/global-spectral-deconvolution/compare/v2.0.2...v2.0.3) (2018-11-01)

<a name="2.0.2"></a>

## [2.0.2](https://github.com/mljs/global-spectral-deconvolution/compare/v2.0.1...v2.0.2) (2018-08-03)

<a name="2.0.0"></a>

# [2.0.0](https://github.com/mljs/global-spectral-deconvolution/compare/v1.1.6...v2.0.0) (2016-11-08)

### Bug Fixes

- **gsd:** more understandable variable names ([e8e9ccb](https://github.com/mljs/global-spectral-deconvolution/commit/e8e9ccb))

### Features

- **gsd:** fix a threshold for first derivative ([4cd0fbb](https://github.com/mljs/global-spectral-deconvolution/commit/4cd0fbb))
- **gsd:** returns as option the boundaries and real height of each peak ([cf7d895](https://github.com/mljs/global-spectral-deconvolution/commit/cf7d895))

### BREAKING CHANGES

- gsd: rename i for index
