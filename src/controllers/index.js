import {Router} from 'express'
import {tryResponse} from 'common-node/libs/middleware'
import moment from 'moment'

export default (rootCtx) => {
  const router = Router()

  router.get(
    '/countdown',
    tryResponse(async (req, res, next, ctx) => {
      const {config} = ctx

      return moment(config.WEDDING_START_TIME).diff(moment())
    })
  )

  return router
}
