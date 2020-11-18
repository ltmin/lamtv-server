import path from 'path'
import {Router} from 'express'
import {readJsonAsync} from 'common-node/libs/file'

export default (ctx) => {
  const {config} = ctx

  const router = Router()

  router.get('/health', async (req, res, next) => {
    const pkgPath = path.join(config.app.dir, 'package.json')
    const pkg = await readJsonAsync(pkgPath)

    const result = {
      version: pkg.version,
      healthy: true,
      app: config.app.name,
    }

    res.success(result)
  })

  return router
}
