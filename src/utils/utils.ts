import { message } from 'antd';
import { parse } from 'querystring';
import { listRender, enumer } from './hooks';
import { useModel } from 'umi';
import _ from 'lodash';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
    if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
        return true;
    }
    return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
    const { NODE_ENV } = process.env;
    if (NODE_ENV === 'development') {
        return true;
    }
    return isAntDesignPro();
};

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

export const switchRole = (role: number) => {
    switch (role) {
        case 1: return '所有者'
        case 2: return '管理员'
        case 3: return '成员'
        default: return ''
    }
}

export const switchUserRole = (name: string) => {
    return new Map([
        ['user', '普通用户'],
        ['sys_test_admin', '测试管理员'],
        ['sys_admin', '系统管理员'],
        ['super_admin', '超级管理员'],
        ['ws_tourist', '游客'],
        ['ws_member', 'workspace成员'],
        ['ws_tester_admin', '测试管理员'],
        ['ws_tester', '测试人员'],
        ['ws_admin', '管理员'],
        ['all', '全部'],
        ['ws_owner', '所有者'],
    ]).get(name)
}

export const switchBusinessType = (business_type: string) => {
    switch (business_type) {
        case 'functional': return '业务功能测试'
        case 'performance': return '业务性能测试'
        case 'business': return '业务接入测试'
        default: return '业务'
    }
}

export const switchTestType = (str: string) => {
    switch (str) {
        case 'functional': return '功能'
        case 'performance': return '性能'
        case 'stability': return '稳定性'
        case 'business': return '业务'
        default: return ''
    }
}
export const switchChineseType = (str: string) => {
    switch (str) {
        case '功能测试': return '功能'
        case '性能测试': return '性能'
        case '稳定性测试': return '稳定性'
        default: return ''
    }
}

export const switchServerType = (str: string) => {
    switch (str) {
        case 'aligroup': return '内网'
        case 'aliyun': return '云上'
        default: return ''
    }
}

/**
 * 获取当前 url 上的参数值
 * @param { string } key 参数名
 */
export function getQuery(key: string, url = window.location.href) {
    const urlObj = new URL(url)
    const searchString = urlObj.search
    const hashSearchString = urlObj.search.split('?')[1] || ''

    const resultQuery = {
        ...parse(searchString),
        ...parse(hashSearchString),
    }
    if (key) return resultQuery[key] || ''

    return resultQuery
}

/**
 *  匹配类型
 * @param params
 */
export const matchType = (params: any) => {
    // test suite搜索页面
    if (params === 0) return ''
    if (params === 1) return '已添加'
    if (params === 'performance') return '性能'
    //
    if (params === 'standalone') return '单机'
    if (params === 'cluster') return '集群'
    //
    if (params === 'functional') return '功能'
    if (params === 'performance') return '性能'
    return ''
}

/** pipLine组件：根据状态 匹配 颜色 */
// 状态全部改成success, 没有complete
export const getColorByState = (itemState: any, stepState: any) => {
    // 优先判断父级状态是否是stop
    if (stepState === 'stop') return '#CECECE'
    // 判断本级状态
    if (itemState === 'running' || itemState === 'pending') return '#CECECE'
    if (itemState === 'success') return '#81BF84'
    if (itemState === 'fail') return '#C84C5A'
    if (itemState === 'stop') return '#CECECE'
    return '#CECECE'
}

/** pipLine组件：根据状态 匹配箭头 颜色 */
export const getStepColorByState = (params: any) => {
    if (params === 'success' || params === 'fail') return '#1890FF' // 蓝色
    if (params === 'running' || params === 'pending' || params === 'stop') return '#CECECE' // 灰色
    return '#CECECE'
}

/**
 * 判断当前 string 是否是 url 格式
 * @param { string } str url string
 */
export function isUrl2(str: any) {
    try {
        const urlObj = new URL(str);
        const { href, host, origin, hostname, pathname } = urlObj;
        return href && host && origin && hostname && pathname && true
    } catch (err) {
        return false
    }
}

// 重组数据结构
export function resetImage(list: any, onceName: string, typeName: string) {
    if (Array.isArray(list)) {
        // 收集第一层数据
        let keyList: any = []
        list.forEach((item) => {
            if (keyList.indexOf(item[onceName]) < 0) {
                !_.isUndefined(item[onceName]) && keyList.push(item[onceName])
            }
        })
        const secondary = keyList.map((key: any) => {
            const group = list.filter((item: any) => item[onceName] === key)
            let arr: any = []
            group.forEach((item) => {
                if (arr.indexOf(item[typeName]) < 0) {
                    arr.push(item[typeName])
                }
            })
            const result = arr.map((item: any) => {
                const children = list.filter((l: any) => l[onceName] === key && l[typeName] === item).map((k) => ({
                    value: k.id,
                    label: listRender(k)
                }))
                return ({ value: item, label: item, children })
            })
            const row = {
                value: enumer(key),
                label: enumer(key),
                children: result
            }
            return row
        })

        return secondary
    }
    return []
}
export function resetECI(list: any, typeName: string) {
    if (Array.isArray(list)) {
        // 收集第一层数据
        let nameList: any = []
        list.forEach((item) => {
            if (nameList.indexOf(item[typeName]) < 0) {
                nameList.push(item[typeName])
            }
        })

        const dataSet = nameList.map((key: any) => {
            const group = list.filter(
                (item: any) => item[typeName] === key)
                .map(
                    item => (
                        {
                            value: item.id,
                            label: listRender(item)
                        }
                    )
                )
            const row = {
                value: key,
                label: key,
                children: group
            }
            return row
        })
        return dataSet
    }
    return []
}
export const enumerChinese =  ( name:any ) => {
    const list = {
        '公共镜像':'system',
        '自定义镜像':'self',
        '共享镜像':'others'
    }
    return list[name];
}
export const enumerEnglish =  ( name:any ) => {
    const list = {
        system:'公共镜像',
        self:'自定义镜像',
        others:'共享镜像'
    }
    return list[name];
}

export const gblen = (str: string) => {
    let len = 0;
    for (let i = 0; i < str.length; i++)
        str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94 ?
            len += 2 :
            len++
    return len;
}

export const gblenStr = (str: string, max: number) => {
    let len = 0;
    let word = ''
    for (let i = 0; i < str.length; i++) {
        if (max <= len) return word
        str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94 ?
            len += 2 :
            len++
        word += str[i]
    }
    return word
}


/**
 * @module 业务测试
 * @description 测试类型枚举数据
 */
export const test_type_enum = [
    { value: 'functional', name: '功能测试' },
    { value: 'performance', name: '性能测试' },
    { value: 'business', name: '接入测试' },
]
/**
* @module 业务测试
* @description 运行模式枚举数据
*/
export const runList = [{ id: 'standalone', name: '单机' }, { id: 'cluster', name: '集群' }]


/**
 * @module 测试结果-结果详情页
 * @returns 测试类型的枚举
 */
export const matchTestType = (params: string) => {
    switch (params) {
        case '功能测试': return "functional"
        case '性能测试': return "performance"
        case '业务功能测试': return "business_functional"
        case '业务性能测试': return "business_performance"
        case '业务接入测试': return "business_business"
        default: return ''
    }
}

export const targetJump = (href: string) => {
    const win: any = window.open("");
    setTimeout(function () { win.location.href = href })
    // const a = document.createElement('a')
    // a.href = href
    // a.target = '__blank'
    // a.style.width = '0px'
    // a.style.height = '0px'

    // document.body.appendChild( a )
    // a.click()
    // // document.body.removeChild( a )
}

export const requestCodeMessage = (code: number, msg: string) => {
    if (code === 200) return message.success(msg)
    if (code === 201) return message.warning(msg)
    return message.error(msg)
}

/**
 * @description 获取当前用户的角色。
 * @param type ws级 or 系统级
 * @returns 用户的角色
 * */
//
export function matchRoleEnum(type = 'ws') {
    const { initialState } = useModel('@@initialState');
    const currentRole = initialState?.authList[`${type == 'ws' ? 'ws_role_title' : 'sys_role_title'}`]
    const currentRoleId = initialState?.authList?.user_id;
    return { currentRole, currentRoleId };
};

export const role_type_enum = [
    { key: 'ws_member', name: 'worksapce成员' },
    { key: 'ws_tester', name: '测试人员' },
    { key: 'ws_tester_admin', name: '测试管理员' },
    { key: 'sys_admin', name: '系统管理员' },
];

export const deepObject = (data: any) => {
    return Object.keys(data).reduce((p, c) => {
        const ctx = data[c]
        const len = Object.keys( ctx )
        if ( len.length > 0 ) {
            len.forEach(( t ) => {
                p[t] = ctx[t]
            })
        }
        else
            p[c] = data[c]
        return p
    }, {})
}