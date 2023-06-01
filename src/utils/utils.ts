/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prefer-const */
import React from 'react';
import { message } from 'antd';
import { parse } from 'querystring';
import { getLocale, history, request } from 'umi'
import { listRender, enumer, textRender } from './hooks';
import _ from 'lodash';

const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const OPENANOLIS_DOMAIN = "https://passport.openanolis.cn/"

export const OPENANOLIS_LOGIN_URL = OPENANOLIS_DOMAIN + "login?callback=" + window.location.origin
export const OPENANOLIS_LOGOUT_URL = OPENANOLIS_DOMAIN + "logout?callback=" + window.location.origin
export const OPENANOLIS_REGIST_URL = OPENANOLIS_DOMAIN + "register"

export const getPageWsid = () => {
  return window.location.pathname.replace(/^\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
}

export const redirectErrorPage = (stateCode: number | string) => {
  const { location } = window
  if (~location.pathname.indexOf(`/${stateCode}`)) return
  const query = parse(location.search.substring(1))
  const { page } = query
  if (page) return
  const ws_id = getPageWsid()
  const link = ws_id && /^[a-zA-Z0-9]{8}$/.test(ws_id) ? `/ws/${ws_id}` : ""
  history.push(`${link}/${stateCode}?page=${location.href}`)
}

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

export const saveRefenerceData = async (data: any) => {
  const { data: formId, code } = await request(`/api/case/ws_case/params/`, { method: "post", data })
  if (code !== 200) return
  return formId
}

export const jumpWorkspace = (ws_id: string) => `/ws/${ws_id}/test_result`;

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
    case 1:
      return '所有者';
    case 2:
      return '管理员';
    case 3:
      return '成员';
    default:
      return '';
  }
};

export const getCompareType = ({ is_job, is_baseline }: any) => {
  const hasJob = Object.prototype.toString.call(is_job) === "[object Number]"
  const hasBaseline = Object.prototype.toString.call(is_baseline) === "[object Number]"
  let isBaseline
  if (hasJob) isBaseline = is_job === 0 ? true : false
  if (hasBaseline) isBaseline = is_baseline === 0 ? false : true
  return isBaseline
}

export const switchUserRole = (name: string) => {
  return new Map([
    ['user', '普通用户'],
    ['sys_test_admin', '测试管理员'],
    ['sys_admin', '系统管理员'],
    ['ws_tourist', '游客'],
    ['ws_member', 'workspace成员'],
    ['ws_test_admin', '测试管理员'],
    ['ws_tester', '测试人员'],
    ['ws_admin', '管理员'],
    ['all', '全部'],
    ['ws_owner', '所有者'],
  ]).get(name);
};

export const switchUserRole2 = (name: string, formatMessage: any) => {
  return new Map([
    ['user', formatMessage({ id: 'member.type.user' })],
    ['sys_test_admin', formatMessage({ id: 'member.type.sys_test_admin' })],
    ['sys_admin', formatMessage({ id: 'member.type.sys_admin' })],
    ['ws_tourist', formatMessage({ id: 'member.type.ws_tourist' })],
    ['ws_member', formatMessage({ id: 'member.type.ws_member' })],
    ['ws_test_admin', formatMessage({ id: 'member.type.ws_test_admin' })],
    ['ws_tester', formatMessage({ id: 'member.type.ws_tester' })],
    ['ws_admin', formatMessage({ id: 'member.type.ws_admin' })],
    ['all', formatMessage({ id: 'member.type.all' })],
    ['ws_owner', formatMessage({ id: 'member.type.ws_owner' })],
    ['super_admin', formatMessage({ id: 'member.type.super_admin' })],
  ]).get(name);
};


export const switchBusinessType = (business_type: string) => {
  switch (business_type) {
    case 'functional':
      return '业务功能测试';
    case 'performance':
      return '业务性能测试';
    case 'business':
      return '业务接入测试';
    default:
      return '业务';
  }
};

export const switchTestType = (str: string, formatMessage: any) => {
  switch (str) {
    case 'functional': return formatMessage({ id: str })
    case 'performance': return formatMessage({ id: str })
    case 'stability': return formatMessage({ id: str })
    case 'business': return formatMessage({ id: str })
    default: return ''
  }
};

export const switchChineseType = (str: string) => {
  switch (str) {
    case '功能测试':
      return 'functional'; // '功能'
    case '性能测试':
      return 'performance'; // 性能
    case '稳定性测试':
      return 'stability'; // '稳定性'
    default:
      return '-';
  }
};

export const switchServerType = (str: string, formatMessage?: any) => {
  return str === 'aligroup' ? formatMessage({ id: 'aligroupServer' }) : formatMessage({ id: 'aliyunServer' });
  /* switch (str) {
        case 'aligroup': return '内网'
        case 'aliyun': return '云上'
        default: return ''
    } */
};

/**
 * 获取当前 url 上的参数值
 * @param { string } key 参数名
 */
export function getQuery(key: string, url = window.location.href) {
  const urlObj = new URL(url);
  const searchString = urlObj.search;
  const hashSearchString = urlObj.search.split('?')[1] || '';

  const resultQuery = {
    ...parse(searchString),
    ...parse(hashSearchString),
  };
  if (key) return resultQuery[key] || '';

  return resultQuery;
}

/**
 *  匹配类型
 * @param params
 */
export const matchType = (params: any, formatMessage?: any) => {
  // test suite搜索页面
  if (params === 0) return '';
  if (params === 1) return formatMessage({ id: 'added' });
  if (params === 'performance') return formatMessage({ id: 'performance' });
  //
  if (params === 'standalone') return formatMessage({ id: 'standalone' });
  if (params === 'cluster') return formatMessage({ id: 'cluster' });
  //
  if (params === 'functional') return formatMessage({ id: 'functional' });
  if (params === 'performance') return formatMessage({ id: 'performance' });
  if (params === 'business') return formatMessage({ id: 'business' });
  return params
};

/** pipLine组件：根据状态 匹配 颜色 */
// 状态全部改成success, 没有complete
export const getColorByState = (itemState: any, stepState: any) => {
  // 优先判断父级状态是否是stop
  if (stepState === 'stop') return '#CECECE';
  // 判断本级状态
  if (itemState === 'running' || itemState === 'pending') return '#CECECE';
  if (itemState === 'success') return '#81BF84';
  if (itemState === 'fail') return '#C84C5A';
  if (itemState === 'stop') return '#CECECE';
  return '#CECECE';
};

/** pipLine组件：根据状态 匹配箭头 颜色 */
export const getStepColorByState = (params: any) => {
  if (params === 'success' || params === 'fail') return '#1890FF'; // 蓝色
  if (params === 'running' || params === 'pending' || params === 'stop') return '#CECECE'; // 灰色
  return '#CECECE';
};

/**
 * 判断当前 string 是否是 url 格式
 * @param { string } str url string
 */
export function isUrl2(str: any) {
  try {
    const urlObj = new URL(str);
    const { href, host, origin, hostname, pathname } = urlObj;
    return href && host && origin && hostname && pathname && true;
  } catch (err) {
    return false;
  }
}

// 重组数据结构
export function resetImage(list: any, onceName: string, typeName: string, os_name: string) {
  if (Array.isArray(list)) {
    // 收集第一层数据
    let keyList: any = [];
    list.forEach((item) => {
      if (keyList.indexOf(item[onceName]) < 0) {
        !_.isUndefined(item[onceName]) && keyList.push(item[onceName]);
      }
    });

    const secondary = keyList.map((key: any) => {
      const group = list.filter((item: any) => item[onceName] === key);
      let arr: any = [];
      group.forEach((item) => {
        if (arr.indexOf(item[typeName]) < 0) {
          arr.push(item[typeName]);
        }
      });

      const result = arr.map((item: any) => {
        const osList = list.filter(
          (child: any) => child[onceName] === key && child[typeName] === item,
        );
        let arr: any = [];
        osList.forEach((item) => {
          if (arr.indexOf(item[os_name]) < 0) {
            arr.push(item[os_name]);
          }
        });
        const osName = arr.map((r: any) => {
          const param: any = [{ value: 'latest', label: 'latest' }];
          const children = param.concat(
            list
              .filter((l: any) => l[onceName] === key && l[typeName] === item && l[os_name] === r)
              .map((k) => ({
                value: k.id,
                label: listRender(k),
              })),
          );
          return { value: r, label: textRender(r), children };
        });
        return { value: item, label: textRender(item), children: osName };
      });

      const row = {
        value: enumer(key),
        label: enumer(key),
        children: result,
      };
      return row;
    });

    return secondary;
  }
  return [];
}

export function resetECI(list: any, typeName: string) {
  if (Array.isArray(list)) {
    // 收集第一层数据
    let nameList: any = [];
    list.forEach((item) => {
      if (nameList.indexOf(item[typeName]) < 0) {
        nameList.push(item[typeName]);
      }
    });

    const dataSet = nameList.map((key: any) => {
      const group = list
        .filter((item: any) => item[typeName] === key)
        .map((item) => ({
          value: item.id,
          label: listRender(item),
        }));
      const row = {
        value: key,
        label: key,
        children: group,
      };
      return row;
    });
    return dataSet;
  }
  return [];
}
export const enumerChinese = (name: any) => {
  const list = {
    公共镜像: 'system',
    自定义镜像: 'self',
    共享镜像: 'others',
  };
  return list[name];
};
export const enumerEnglish = (name: any, formatMessage: any) => {
  const list = {
    system: formatMessage({ id: `system.image` }),
    self: formatMessage({ id: `${name}.image` }),
    others: formatMessage({ id: `${name}.image` }),
  };
  return list[name];
};

export const gblen = (str: string) => {
  let len = 0;
  for (let i = 0; i < str.length; i++)
    str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94 ? (len += 2) : len++;
  return len;
};

export const gblenStr = (str: string, max: number) => {
  let len = 0;
  let word = '';
  for (let i = 0; i < str.length; i++) {
    if (max <= len) return word;
    str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94 ? (len += 2) : len++;
    word += str[i];
  }
  return word;
};

/**
 * @module 业务测试
 * @description 测试类型枚举数据
 */
export const test_type_enum = [
  { value: 'functional', name: '功能测试' },
  { value: 'performance', name: '性能测试' },
  { value: 'business', name: '接入测试' },
];
/**
 * @module 业务测试
 * @description 运行模式枚举数据
 */
export const runList = [
  { id: 'standalone', name: '单机' },
  { id: 'cluster', name: '集群' },
];

/**
 * @module 测试结果-结果详情页
 * @returns 测试类型的枚举
 */
export const matchTestType = (params: string) => {
  switch (params) {
    case '功能测试':
      return 'functional';
    case '性能测试':
      return 'performance';
    case '业务功能测试':
      return 'business_functional';
    case '业务性能测试':
      return 'business_performance';
    case '业务接入测试':
      return 'business_business';
    default:
      return params || '';
  }
};

/**
 * @module 测试结果-结果详情页
 * @returns Mode
 */
export const matchMode = (params: string) => {
  switch (params) {
    case '单机':
      return 'standalone';
    case '集群':
      return 'cluster';
    default:
      return params || '';
  }
};

export const targetJump = (href: string) => {
  const win: any = window.open('');
  setTimeout(function () {
    win.location.href = href;
  });
  // const a = document.createElement('a')
  // a.href = href
  // a.target = '__blank'
  // a.style.width = '0px'
  // a.style.height = '0px'

  // document.body.appendChild( a )
  // a.click()
  // // document.body.removeChild( a )
};

export const requestCodeMessage = (code: number, msg: string) => {
  if (!msg) return;
  if (code === 200) return message.success(msg);
  if (code === 201) return message.warning(msg);
  return message.error(msg);
};

/**
 * @description 获取当前用户的角色。
 * @param type ws级 or 系统级
 * @returns 用户的角色
 * */
//

export const role_type_enum = [
  { key: 'ws_member', name: 'worksapce成员' },
  { key: 'ws_tester', name: '测试人员' },
  { key: 'ws_test_admin', name: '测试管理员' },
  { key: 'sys_admin', name: '系统管理员' },
];

export const deepObject = (data: any) => {
  if (Object.prototype.toString.call(data) !== '[object Object]') return data;
  return Object.keys(data).reduce((p, c) => {
    const ctx = data[c];
    if (Object.prototype.toString.call(ctx) === '[object Object]') {
      const len = Object.keys(ctx);
      if (len.length > 0) {
        len.forEach((t) => {
          p[t] = ctx[t];
        });
      }
    } else p[c] = data[c];
    return p;
  }, {});
};

export const AccessTootip = () => {
  const info = getLocale() === 'en-US' ? 'No operation permission' : '没有操作权限'
  return message.error(info);
};

// ----------------- start 由环境决定的文案 ------------------
// export const getServerType = (type: 1 | 2): any => {
//   const isOpenSource = ['openanolis', 'opensource'].includes(BUILD_APP_ENV as string);
//   const serverArray: any = isOpenSource
//     ? [
//         [1, '固定机器池'],
//         [2, '弹性机器池'],
//       ]
//     : [
//         [1, '内网'],
//         [2, '云上'],
//       ];

//   const result = new Map(serverArray).get(type);
//   return result;
// };

// export const GROUP_MANAGE = `${getServerType(1)}${!BUILD_APP_ENV ? '机器' : ''}`;
// export const CLOUD_MANAGE = `${getServerType(2)}${!BUILD_APP_ENV ? '机器' : ''}`;

// export const aligroupServer = getServerType(1);
// export const aliyunServer = getServerType(2);
// ----------------- end 由环境决定的文案 ------------------


// ----------------- start 替换上面的逻辑 ------------------
const isOpenSource = ['openanolis', 'opensource'].includes(BUILD_APP_ENV as string);

const list_cn = {
  'fixed_pool': '固定机器池',
  'elastic_pool': '弹性机器池',
  'aligroup': '内网',
  'aliyun': '云上',

  // 机器
  'fixed_pool.server': '固定机器池机器',
  'elastic_pool.server': '弹性机器池机器',
  'aligroup.server': '内网机器',
  'aliyun.server': '云上机器',
  // 基线
  'fixed_pool.baseline': '固定机器池基线',
  'elastic_pool.baseline': '弹性机器池基线',
  'aligroup.baseline': '内网基线',
  'aliyun.baseline': '云上基线',
  // 单机 | 集群
  'fixed_pool.standalone': '固定机器池单机',
  'elastic_pool.standalone': '弹性机器池单机',
  'aligroup.standalone': '内网单机',
  'aliyun.standalone': '云上单机',
  //
  'fixed_pool.cluster': '固定机器池集群',
  'elastic_pool.cluster': '弹性机器池集群',
  'aligroup.cluster': '内网集群',
  'aliyun.cluster': '云上集群',
}
const list_en = {
  'fixed_pool': 'Reserved Server Pool',
  'elastic_pool': 'Elastic Server Pool',
  'aligroup': 'Reserved',
  'aliyun': 'Elastic',
  // 机器
  'fixed_pool.server': 'Machine from Reserved Machine Pool',
  'elastic_pool.server': 'Machine from Elastic Machine Pool',
  'aligroup.server': 'Reserved Machine',
  'aliyun.server': 'Elastic Machine',
  // 基线
  'fixed_pool.baseline': 'Reserved Machine Baseline',
  'elastic_pool.baseline': 'Elastic Machin Baseline',
  'aligroup.baseline': 'Reserved Machine Baseline',
  'aliyun.baseline': 'Elastic Machine Baseline',
  // 单机 | 集群
  'fixed_pool.standalone': 'Standalone',
  'elastic_pool.standalone': 'Standalone',
  'aligroup.standalone': 'Standalone',
  'aliyun.standalone': 'Standalone',
  //
  'fixed_pool.cluster': 'Cluster',
  'elastic_pool.cluster': 'Cluster',
  'aligroup.cluster': 'Cluster',
  'aliyun.cluster': 'Cluster',
}
// ----------------- cn ------------------
export const aligroupServer = isOpenSource ? list_cn['fixed_pool'] : list_cn['aligroup'];
export const aliyunServer = isOpenSource ? list_cn['elastic_pool'] : list_cn['aliyun'];
// 机器
export const GROUP_MANAGE = !BUILD_APP_ENV ? (isOpenSource ? list_cn['fixed_pool.server'] : list_cn['aligroup.server']) : aligroupServer;
export const CLOUD_MANAGE = !BUILD_APP_ENV ? (isOpenSource ? list_cn['elastic_pool.server'] : list_cn['aliyun.server']) : aliyunServer;
// 基线
export const aligroupServer_baseline = isOpenSource ? list_cn['fixed_pool.baseline'] : list_cn['aligroup.baseline'];
export const aliyunServer_baseline = isOpenSource ? list_cn['elastic_pool.baseline'] : list_cn['aliyun.baseline'];
// 单机 | 集群
export const aligroupServer_standalone = isOpenSource ? list_cn['fixed_pool.standalone'] : list_cn['aligroup.standalone'];
export const aliyunServer_standalone = isOpenSource ? list_cn['elastic_pool.standalone'] : list_cn['aliyun.standalone'];
export const aligroupServer_cluster = isOpenSource ? list_cn['fixed_pool.cluster'] : list_cn['aligroup.cluster'];
export const aliyunServer_cluster = isOpenSource ? list_cn['elastic_pool.cluster'] : list_cn['aliyun.cluster'];

//------------------ en ------------------
export const aligroupServer_en = isOpenSource ? list_en['fixed_pool'] : list_en['aligroup'];
export const aliyunServer_en = isOpenSource ? list_en['elastic_pool'] : list_en['aliyun'];
// 机器
export const GROUP_MANAGE_en = !BUILD_APP_ENV ? (isOpenSource ? list_en['fixed_pool.server'] : list_en['aligroup.server']) : aligroupServer_en;
export const CLOUD_MANAGE_en = !BUILD_APP_ENV ? (isOpenSource ? list_en['elastic_pool.server'] : list_en['aliyun.server']) : aliyunServer_en;
// 基线
export const aligroupServer_baseline_en = isOpenSource ? list_en['fixed_pool.baseline'] : list_en['aligroup.baseline'];
export const aliyunServer_baseline_en = isOpenSource ? list_en['elastic_pool.baseline'] : list_en['aliyun.baseline'];
// 单机 | 集群
export const aligroupServer_standalone_en = isOpenSource ? list_en['fixed_pool.standalone'] : list_en['aligroup.standalone'];
export const aliyunServer_standalone_en = isOpenSource ? list_en['elastic_pool.standalone'] : list_en['aliyun.standalone'];
export const aligroupServer_cluster_en = isOpenSource ? list_en['fixed_pool.cluster'] : list_en['aligroup.cluster'];
export const aliyunServer_cluster_en = isOpenSource ? list_en['elastic_pool.cluster'] : list_en['aliyun.cluster'];
// ----------------- end 替换上面的逻辑 ------------------


// 分页删除一页最后一条跳转到前一页逻辑处理
export const handlePageNum = (pageCurrent: any, totalCurrent: any) => {
  let page_current = 1
  const { page_num, page_size } = pageCurrent.current
  const { total } = totalCurrent.current
  const totalPage = Math.ceil((total - 1) / page_size)
  const currentPage = page_num > totalPage ? totalPage : page_num
  page_current = currentPage < 1 ? 1 : currentPage
  return page_current
}

export const useStateRef = (state: any) => {
  const stateRef = React.useRef<any>()
  React.useEffect(() => {
    stateRef.current = state
    return () => { }
  }, [state])
  return stateRef
}