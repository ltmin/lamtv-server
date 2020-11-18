import _ from 'lodash'
import path from 'path'
import glob from 'glob'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import {Server} from 'http'

import {assignObjOnce} from 'common-node/libs/object'
import {
  registerReqContext,
  registerResContext,
  registerErrorHandler,
} from 'common-node/libs/middleware'

import {AppEnv} from 'common-node/enums/app'

const initMiddleWares = (ctx) => {
  const {
    app,
    instances: {logger},
    config,
  } = ctx

  const morganConfig = _.get(config, 'morgan', {})
  if (morganConfig.isEnable) {
    app.use(
      morgan(morganConfig.format, {
        stream: {
          write: (...message) => logger.info('<-', ...message),
        },
      })
    )
  }

  app.use(cors())
  app.use(helmet())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: true}))
}

const applyConfiguration = (ctx) => {
  const {
    app,
    config: {
      app: {version, name: appName},
    },
  } = ctx

  app.all('*', (req, res, next) => {
    res.set(appName, version)
    next()
  })

  // app.disable('etag')
}

const healthRouter = (ctx) => {
  const healthRouterPath = path.resolve(__dirname, 'controllers/health.js')
  const healthRouter = require(healthRouterPath)
  const resolver = healthRouter.default || healthRouter.route
  if (!resolver) {
    throw new Error(`${healthRouterPath} is not a router`)
  }

  return resolver(ctx)
}

const initCustomRouters = (ctx) => {
  const {app, config, logger} = ctx

  app.get('/health', healthRouter(ctx))
  logger.info(`-> serve: /health`)

  if (config.env !== AppEnv.prod) {
    app.use('/docs', express.static('docs'))
    logger.info(`-> serve: /docs`)
  }

  app.use(express.static('node_modules/lamtv-wedding/dist'))
}

const initRouters = (ctx) => {
  const {
    app,
    instances: {logger},
    config,
  } = ctx

  const prefix = _.get(config, 'endpoint.prefix', '')

  const controllerPath = path.resolve(__dirname, 'controllers')
  const priorityRouters = glob.sync(path.join(controllerPath, '**/index.js'), {
    dot: true,
  })
  const routers = glob.sync(path.join(controllerPath, '**/*.controller.js'), {
    dot: true,
  })

  const orderedPriorityRouters = _.sortBy(
    priorityRouters,
    (filePath) => _.split(filePath, '/').length
  )

  _.each([...orderedPriorityRouters, ...routers], (filePath) => {
    const router = require(filePath)
    const {dir: routerDir, name: routerName} = path.parse(filePath)
    const subPath = _.replace(routerName, /(^index$)|(\.controller$)/, '')
    const fullPath = path.join(routerDir, subPath)
    const rootPath = path.join(
      prefix,
      '/',
      path.relative(controllerPath, fullPath)
    )
    const routerCtx = assignObjOnce(
      {},
      {
        ...ctx,
        rootPath,
      }
    )

    const resolver = router.default || router.route
    if (!resolver) {
      throw new Error(`${rootPath} is not a router`)
    }

    logger.info(`-> serve: ${rootPath}`)
    app.use(rootPath, resolver(routerCtx))
  })

  initCustomRouters(ctx)
}

const init = () => {
  const app = express()
  const server = new Server(app)

  return {app, server}
}

const start = async (ctx) => {
  const {config, instances} = ctx
  const {logger, app, server} = instances

  const PORT = config.app.port || 3000

  const appContext = assignObjOnce(
    {},
    {
      ...instances,
      app,
      server,
      config,
      instances,
    }
  )

  registerReqContext(app, appContext)
  registerResContext(app, appContext)
  initMiddleWares(appContext)
  applyConfiguration(appContext)
  initRouters(appContext)
  registerErrorHandler(app, logger, appContext)

  server.on('error', (err) => {
    logger.error(`Express server error`, err)
  })

  server.listen(PORT, () => {
    logger.info(`Express server listening on port: ${PORT}`)
  })

  return {app, server}
}

export default {init, start}
