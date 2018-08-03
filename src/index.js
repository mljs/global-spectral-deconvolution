'use strict';

module.exports.gsd = require('./gsd');

module.exports.post = {
  optimizePeaks: require('./post/optimizePeaks'),
  joinBroadPeaks: require('./post/joinBroadPeaks'),
  broadenPeaks: require('./post/broadenPeaks')
};
