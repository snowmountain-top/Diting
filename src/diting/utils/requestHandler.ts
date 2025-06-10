import { Request as ExpressRequest } from 'ultimate-express'

// TODO： 注解方式，塞入请求头, 继承 ExpressRequest
export class RequestHandler {
  getUserInfo(req: ExpressRequest) {
    const openId = req.headers['x-wx-openid'] as string
    const unionId = req.headers['x-wx-unionid'] as string
    const appId = req.headers['x-wx-appid'] as string
    return { appId, openId, unionId }
  }

  getClientIp(req: ExpressRequest) {
    const ip = req.headers['x-original-forwarded-for'] as string
    return ip
  }
}

const requestHandler = new RequestHandler()
export default requestHandler
