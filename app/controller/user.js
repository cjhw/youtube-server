'use strict'

const Controller = require('egg').Controller

class UserControllerler extends Controller {
  async create() {
    const body = this.ctx.request.body

    // 数据校验
    this.ctx.validate({
      username: { type: 'string' },
      email: { type: 'email' },
      password: { type: 'string' }
    })

    const userService = this.service.user

    if (await userService.findByUsername(body.username)) {
      this.ctx.throw(422, '用户名已存在')
    }

    if (await userService.findByEmail(body.email)) {
      this.ctx.throw(422, '该邮箱已注册')
    }
    // 保存用户
    const user = await userService.createUser(body)

    // 生成 token
    const token = userService.createToken({
      userId: user._id
    })
    // 发送响应
    this.ctx.body = {
      user: {
        email: user.email,
        username: user.username,
        token,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  async login() {
    // 数据验证
    const body = this.ctx.request.body
    this.ctx.validate(
      {
        email: { type: 'email' },
        password: { type: 'string' }
      },
      body
    )

    // 判断邮箱是否存在
    const userService = this.service.user
    const user = await userService.findByEmail(body.email)

    if (!user) {
      this.ctx.throw(422, '用户不存在')
    }

    // 判断密码是否正确
    if (this.ctx.helper.md5(body.password) !== user.password) {
      this.ctx.throw(422, '密码不正确')
    }

    // 生成 Token
    const token = userService.createToken({
      userId: user._id
    })

    // 发送响应数据
    this.ctx.body = {
      user: {
        email: user.email,
        token,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  async getCUrrentUser() {
    const user = this.ctx.user
    this.ctx.body = {
      user: {
        email: user.email,
        token: this.ctx.header.authorization,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  async update() {
    // 数据校验
    const body = this.ctx.request.body
    this.ctx.validate(
      {
        email: { type: 'email', required: false },
        password: { type: 'string', required: false },
        username: { type: 'string', required: false },
        channelDescription: { type: 'string', required: false },
        avatar: { type: 'string', required: false }
      },
      body
    )

    // 验证用户信息是否存在
    const userService = this.service.user

    if (body.email) {
      if (
        body.email !== this.ctx.user.email &&
        (await userService.findByEmail(body.email))
      ) {
        this.ctx.throw(422, '邮箱已存在')
      }
    }

    if (body.username) {
      if (
        body.username !== this.ctx.user.username &&
        (await userService.findByUsername(body.username))
      ) {
        this.ctx.throw(422, '用户名已存在')
      }
    }

    if (body.password) {
      body.password = this.ctx.helper.md5(body.password)
    }

    // 更新用户信息
    const user = await userService.updateUser(body)

    this.ctx.body = {
      user: {
        email: user.email,
        password: user.password,
        username: user.username,
        channelDescription: user.channelDescription,
        avatar: user.avatar
      }
    }
  }

  async subscribe() {
    const userId = this.ctx.user._id
    const channelId = this.ctx.params.userId
    // 用户不能订阅自己
    if (userId.equals(channelId)) {
      // objectId上面的一个方法equals用来比较的
      this.ctx.throw(422, '用户不能订阅自己')
    }
    // 添加订阅
    const user = await this.service.user.subscribe(userId, channelId)
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed: true
      }
    }
  }

  async unsubscribe() {
    const userId = this.ctx.user._id
    const channelId = this.ctx.params.userId
    // 用户不能取消订阅自己
    if (userId.equals(channelId)) {
      // objectId上面的一个方法equals用来比较的
      this.ctx.throw(422, '用户不能订阅自己')
    }
    // 取消订阅
    const user = await this.service.user.unsubscribe(userId, channelId)
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed: false
      }
    }
  }

  async getUser() {
    //获取订阅状态
    let isSubscribed = false
    if (this.ctx.user) {
      //获取订阅记录
      const record = await this.app.model.Subscription.findOne({
        user: this.ctx.user._id,
        channel: this.ctx.params.userId
      })
      if (record) {
        isSubscribed = true
      }
    }
    //获取用户信息
    const user = await this.app.model.User.findById(this.ctx.params.userId)
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'email',
          'avatar',
          'cover',
          'channelDescription',
          'subscribersCount'
        ]),
        isSubscribed
      }
    }
  }

  async getSubscriptions() {
    const Subscription = this.app.model.Subscription
    let subscriptions = await Subscription.find({
      user: this.ctx.params.userId
    }).populate('channel')
    subscriptions = subscriptions.map((item) => {
      return this.ctx.helper._.pick(item.channel, ['_id', 'username', 'avatar'])
    })
    this.ctx.body = {
      subscriptions
    }
  }
}

module.exports = UserControllerler
