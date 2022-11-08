import { aligroupServer_en, aliyunServer_en,
  aligroupServer_baseline_en, aliyunServer_baseline_en,
  aligroupServer_standalone_en,
  aliyunServer_standalone_en,
  aligroupServer_cluster_en,
  aliyunServer_cluster_en, 
} from '@/utils/utils'

export default {
  'request.failed': 'Request failed！',
  'request.create.success': 'The creation was successful',
  'request.create.failed': 'The creation was failed',
  'request.delete.success': 'The deletion was successful',  
  'request.delete.failed': 'The deletion was failed',
  'request.update.success': 'The update was successful',
  'request.reset.failed': 'The reset was failed',
  'request.reset.success': 'The reset was successful',
  'request.copy.success': 'The copy was successful',
	'request.save.success': 'The save was successful',
  'validator.failed': 'The verification was failed',
  'sorry, the page cannot be accessed': 'Sorry, the page cannot be accessed…',
  'page links may have expired or been deleted': 'Page links may have expired or been deleted.',
  'no.use.case': 'No test case',
  'select.suite.random': 'Random',
  
	'system.image': 'Public Image',
  'self.image': 'Custom Image',
  'others.image': 'Shared Image',
  
  'performance.test': 'Performance',
  'functional.test': 'Functional',
  'stability.test': 'Stability Test',
  'business.test': 'Business Test',
  'access.test': 'Access Test',
  'io.test': 'IO Test',

	'stability': 'Stability',
  'business': 'Business',
  // test suite 类型
  'performance': 'Performance',
  'functional': 'Functional',
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

  'common.random': 'Random',
  'common.hardware': 'Hardware',
  'common.instance.ID': 'Instance ID',
  'common.private_ip': 'IP',
  'common.instance_type': 'Instance Type',
  'common.bandwidth': 'Bandwidth',
  'common.system_disk': 'System Disk',
  'common.storage_type': 'Data Disk',
  'common.soft': 'Software',
  'common.image_name': 'Image',
  'common.server.state': 'Server State',
  'common.channel_type': 'Channel Type',
  'common.extended.field': 'Extension Field',
  //
  'common.cloud': 'Cloud',
  'common.cloud_efficiency': 'Efficient Cloud',
  'common.cloud_ssd': 'SSD Cloud',
  'common.cloud_essd': 'ESSD Cloud',
};
