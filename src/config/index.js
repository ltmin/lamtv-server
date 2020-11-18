import util from 'util'
import _ from 'lodash'
import path from 'path'
import {readJsonSync} from 'common-node/libs/file'

const env = process.env.NODE_ENV || 'local'

const envConfig = readJsonSync(path.join(__dirname, `env/${env}.json`))
const commonConfig = readJsonSync(path.join(__dirname, 'common.json'))

const config = _.merge({}, commonConfig, envConfig, {
  env,
  app: {
    port: process.env.NODE_PORT,
    dir: process.cwd(),
  },
})

console.log(util.inspect(config, {depth: 5}))

export default config
