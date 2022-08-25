import { aligroupServer_en, aliyunServer_en,
  aligroupServer_baseline_en, aliyunServer_baseline_en,
  aligroupServer_standalone_en,
  aliyunServer_standalone_en,
  aligroupServer_cluster_en,
  aliyunServer_cluster_en, 
} from '@/utils/utils'

export default {
  'request.failed': 'Request failed！',
  'request.create.success': 'The creation was successful.',
  'request.create.failed': 'The creation was failed.',
  'request.delete.success': 'The deletion was successful.',  
  'request.delete.failed': 'The deletion was failed.',
  'request.update.success': 'The update was successful.',
  'request.copy.success': 'The replication was successful.',
	'request.save.success': 'The save was successful.', 
  'validator.failed': 'The verification was failed',
  'sorry, the page cannot be accessed': 'Sorry, the page cannot be accessed…',
  'page links may have expired or been deleted': 'Page links may have expired or been deleted.',
  'no.use.case': 'No test case.',
  
	'system.image': 'Public Image',
  'self.image': 'Custom Image',
  'others.image': 'Shared Image',
  
  'performance.test': 'Performance test',
  'functional.test': 'Function test',
  'stability.test': 'Stability test',
  'business.test': 'Business test',
  'access.test': 'Access test',
  'io.test': 'IO test',

	'stability': 'Stability',
  'business': 'Business',
  // test suite 类型
  'performance': 'Performance',
  'functional': 'Function',
  'standalone': 'Standalone',
  'cluster': 'Cluster',
  'added': 'Added',

  // server_provider
  'aligroup': '固定机器池',
  'aliyun': 'Elastic machine pool',


  'aligroupServer': aligroupServer_en, //这是引用变量不用翻译
  'aliyunServer': aliyunServer_en,
  // 基线
  'aligroupServer.baseline': aligroupServer_baseline_en,
  'aliyunServer.baseline': aliyunServer_baseline_en,
  // 单机 | 集群
  'aligroupServer.standalone': aligroupServer_standalone_en,
  'aliyunServer.standalone': aliyunServer_standalone_en,
  'aligroupServer.cluster': aligroupServer_cluster_en,
  'aliyunServer.cluster': aliyunServer_cluster_en,
};
