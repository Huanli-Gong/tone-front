import {
  aligroupServer, // '内网' | '固定机器池'
  aliyunServer,   // '云上' | '弹性机器池'
} from '@/utils/utils';

const defaultKey = 'header'

const text =  {
  'create_job_type_text': '新建job类型',
  'create.by.job': '通过Job类型新建',
  'create.by.template': '通过模板新建',

  'all': '全部', 
  'functional': '功能测试', 
  'performance': '性能测试',
  'business': '业务测试',
  'stability': '稳定性测试',
  // Server Type
  'aligroup': aligroupServer, // '内网',
  'aliyun': aliyunServer,     // '云上',

  // Test Type
  'test_type.functional': '功能',
  'test_type.performance': '性能',
  'test_type.business': '业务',
  'test_type.stability': '稳定性',
  // Business Type
  'business.functional': '业务功能测试',
  'business.performance': '业务性能测试',
  'business.business': '业务接入测试',
  'business.others': '业务',

  'delete.the.problem.template': '问题模板，请及时删除',
};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})
