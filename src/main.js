import './global'
import util from 'util'
import rawConfig from '/config'

import {parse as parseConfig} from 'common-node/libs/config'
import {assignObjOnce} from 'common-node/libs/object'

import Logger from 'common-node/factory/logger'
import Server from './server'

const startApp = async () => {
  const config = await parseConfig(rawConfig)

  const {logger} = await Logger.init({config})

  process.on('uncaughtException', (e) => {
    logger.error('Exiting due to unhandled exception', util.inspect(e))
    process.exit(1)
  })

  process.on('unhandledRejection', (e) => {
    logger.error('Exiting due to unhandled rejection', util.inspect(e))
    process.exit(1)
  })

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, exiting...')
    process.exit(1)
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, exiting...')
    process.exit(1)
  })

  const ctx = assignObjOnce(
    {},
    {
      config,
      instances: {logger},
    }
  )

  const {app, server} = await Server.init(ctx)
  assignObjOnce(ctx.instances, {app, server})

  await Server.start(ctx)
}

startApp().catch(console.error)
