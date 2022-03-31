'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app
  const auth = app.middleware.auth()

  router.prefix('/api/v1')
  // 用户注册
  router.post('/users', controller.user.create)
  // 用户登录
  router.post('/users/login', controller.user.login)
  // 获取当前登录用户
  router.get('/user', auth, controller.user.getCUrrentUser)
  // 更新当前登录用户
  router.patch('/user', auth, controller.user.update)
  // 获取用户(频道)
  router.get(
    '/users/:userId',
    app.middleware.auth({ required: false }),
    controller.user.getUser
  )

  // 用户订阅

  // 订阅频道
  router.post('/users/:userId/subscribe', auth, controller.user.subscribe)
  // 取消订阅频道
  router.delete('/users/:userId/subscribe', auth, controller.user.unsubscribe)
  // 获取用户的订阅列表
  router.get('/users/:userId/subscriptions', controller.user.getSubscriptions)

  //阿里云 VOD
  // 获取视频上传地址和凭证
  router.get('/vod/CreateUploadVideo', auth, controller.vod.createUploadVideo)
  // 处理视频超时
  router.get('vod/RefreshUploadVideo', auth, controller.vod.refreshUploadVideo)

  //视频

  // 创建视频
  router.post('/videos', auth, controller.video.createVideo)
  //获取视频详情
  router.get(
    '/videos/:videoId',
    app.middleware.auth({ required: false }),
    controller.video.getVideo
  )
  // 获取视频列表
  router.get('/videos', controller.video.getVideos)
  // 获取用户发布的视频列表
  router.get('/users/:userId/videos', controller.video.getUserVideos)
  // 获取用户关注的频道视频列表
  router.get('/user/videos/feed', auth, controller.video.getUserFeedVideos)
  //修改视频
  router.patch('/videos/:videoId', auth, controller.video.updateVideo)
  // 删除视频
  router.delete('/videos/:videoId', auth, controller.video.deleteVideo)
  //添加视频评论
  router.post('/videos/:videoId/comments', auth, controller.video.createComment)
  // 获取视频评论列表
  router.get('/videos/:videoId/comments', controller.video.getVideoComments)
  // 删除视频评论
  router.delete(
    '/videos/:videoId/comments/:commentId',
    auth,
    controller.video.deleteVideoComment
  )
  // 喜欢视频
  router.post('/videos/:videoId/like', auth, controller.video.likeVideo)
  // 不喜欢视频
  router.post('/videos/:videoId/dislike', auth, controller.video.dislikeVideo)
  // 获取用户喜欢的视频列表
  router.get('/user/videos/liked', auth, controller.video.getUserLikedVideos)
}
