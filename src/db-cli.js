require('./global')
const path = require('path')

const [, , ...cmds] = process.argv

BPromise.each(cmds, async (cmd) => {
  console.info('______________', cmd, '______________')
  await require(path.join('common-node/factory/dbs', cmd)).default
  console.info('______________', cmd, '______________')
}).then(() => process.exit(0))
