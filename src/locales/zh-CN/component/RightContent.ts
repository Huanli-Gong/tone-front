const defaultKey = 'right.content'

const text =  {
  'all.read': '全部已读',
  'task.notification': '任务通知',
  'system.notification': '系统通知',
  'view.all': '查看全部',
  'login': '登录',
  'register': '注册',

  'center': '个人中心',
  'settings': '个人设置',
  'logout': '退出登录',
  'home.page': '个人主页',

  // 枚举
  'wait.create': '创建',
  'wait.delete': '注销',
  'wait.join': '加入',
  'passed.create': '创建申请',
  'passed.delete': '注销申请',
  'passed.join': '申请',
  'refused.create': '创建申请',
  'refused.delete': '注销申请',

  // utils
  'join.through.you': '通过你加入',
  'pass': '通过',
  'refuse.you.to.join': '拒绝你加入',
  'refuse': '拒绝', 
  'add.you.as': '把你添加为',
  'set.you.to': '把你设置为',
  'add.you.as.t-one': '把你添加为T-One',
  'remove.you': '把你移除',
  'put': '把',
  'transfer.to.you': 'owner转让给你',

  'job.complete': '[Job] 测试完成',
  'plan.complete': '[计划] 测试完成',
  'machine.broken': '[故障] 测试机器故障',
  'broken.span1': '上的任务在测试准备阶段失败, 机器可能已经',
  'broken.span2': '故障',
  'broken.span3': '，请及时处理 ！影响的Job:',
  'broken.span4': '影响的Suite有:',
  'system.announcement': '[公告] 系统公告',
  'nothing': '暂无',
  'no.notice': '暂无通知',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})
