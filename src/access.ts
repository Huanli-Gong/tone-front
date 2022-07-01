// 权限限制文件
export default function (initialState: any) {
    const AuthList: any = initialState?.AuthList
    const sys_role_title: string = AuthList?.sys_role_title || ''
    const ws_role_title: string = AuthList?.ws_role_title || ''
    const user_id: number | string | never = AuthList?.user_id || null

    // 系统管理员权限 & 帮助文档
    const IsAdmin = () => ['sys_admin'].includes(sys_role_title)
    // 系统测试管理员权限
    const IsSysTestAdmin = () => ['sys_admin','sys_test_admin','sys_tester_admin'].includes(sys_role_title)
    // 判断是否登录
    const loginBtn = () => Object.prototype.toString.call(user_id) === "[object Number]"
    // 申请加入私密ws & 创建ws
    const ApplyPrivate = () => BUILD_APP_ENV ? IsAdmin() : true
    // ws设置入口 || job模版(查看、预览)
    const WsSetUp = ['ws_owner','ws_admin','ws_test_admin','ws_member','ws_tester_admin']
    const IsWsSetting = () => IsAdmin() || WsSetUp.includes(ws_role_title)
    // ws基础配置(更改封面，显示名，介绍，是否公开) || 成员管理(添加成员) || 移除 || 审批管理
    const WsBtnPermission = () => IsAdmin() || ['ws_owner','ws_admin'].includes(ws_role_title)
    // ws所有权转交、注销  
    const WsTransfer = () => IsAdmin() || ['ws_owner'].includes(ws_role_title)
    // ws成员无权限
    const WsMemberNoPermission = () => IsAdmin() || ['ws_owner','ws_admin','ws_test_admin','ws_tester_admin'].includes(ws_role_title)
    // ws成员仅可操作自己 
    const WsMemberOperateSelf = (userId?: any) => {
        if(WsMemberNoPermission()) return true
        return ws_role_title === 'ws_member' && userId === user_id
    }
    // 游客无权限
    const WsTourist = () => !IsAdmin() && !['ws_tourist'].includes(ws_role_title)
    return {
        IsAdmin,
        IsSysTestAdmin,
        loginBtn,
        ApplyPrivate,
        IsWsSetting,
        WsBtnPermission,
        WsTransfer,
        WsMemberNoPermission,
        WsMemberOperateSelf,
        WsTourist,
    }
}