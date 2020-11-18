import _ from 'lodash'
import path from 'path'
import glob from 'glob'
import {assignObjOnce} from 'common-node/libs/object'

const initWorkers = async (ctx) => {
  const {logger} = ctx

  const workerPath = path.resolve(__dirname, 'workers')

  const priorityWorkers = glob.sync(path.join(workerPath, '**/index.js'), {
    dot: true,
  })
  const workers = glob.sync(path.join(workerPath, '**/*.worker.js'), {
    dot: true,
  })

  _.each([...priorityWorkers, ...workers], async (filePath) => {
    const worker = await import(filePath)

    const {name: workerName} = path.parse(filePath)
    const subPath = _.replace(workerName, /(^index$)|(\.worker$)/, '')
    logger.info(`-> worker: ${subPath}`)

    setImmediate(() => (worker.default || worker.start)(ctx))
  })
}

const start = async (ctx) => {
  const {config, instances} = ctx

  const appContext = assignObjOnce(
    {},
    {
      ...instances,
      config,
      instances,
    }
  )

  await initWorkers(appContext)
}

export default {start}
