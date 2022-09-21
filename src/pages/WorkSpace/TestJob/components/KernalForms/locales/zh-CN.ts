const defaultKey = 'kernel.form'

const text =  {
  'kernel_version': '内核版本',
  'kernel_version.message': '请选择内核版本',
  'kernel_version.placeholder': '请选择',
  'kernel.package': 'kernel包路径',
  'kernel.package.message': '请输入kernel包路径',
  'devel.package': 'devel包',
  'devel.package.message': '请输入devel包',
  'headers.package': 'headers包',
  'headers.package.message': '请输入headers包',
  'hotfix_install.message': '请选择',
  'script': '内核脚本',
  'script.placeholder': '请输入内核脚本内容',
  'pos': '安装时机',
  'pos.before': '安装内核前',
  'pos.after': '安装内核后',
  'add.kernel': '+ 添加内核脚本',
  // message success

  // build kernel form
  'code_repo': '代码仓库',
  'code_repo.message': '请选择代码仓库',
  'code_repo.placeholder': '请选择',
  'code_branch': '代码分支',
  'code_branch.message': '请选择代码分支',
  'compile_branch': '编译分支',
  'compile_branch.message': '请输入编译工具的分支',
  'cpu_arch': 'CpuArch',
  'cpu_arch.message': '请选择CpuArch',
  'cpu_arch.placeholder': '请选择',
  'commit_id.placeholder': '请输入',
  'build_config.placeholder': '请输入编译工具的分支',
  'build_machine.placeholder': '请输入编译工具的分支',

};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})