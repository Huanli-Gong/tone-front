const defaultKey = 'kernel.form'

const text =  {
  'kernel_version': 'Kernel Version',
  'kernel_version.message': 'Select Kernel Version',
  'kernel_version.placeholder': 'Select',
  'kernel.package': 'Kernel Package',
  'kernel.package.message': 'Enter kernel package',
  'devel.package': 'Devel Package',
  'devel.package.message': 'Enter devel package',
  'headers.package': 'Headers Package',
  'headers.package.message': 'Enter headers package',
  'hotfix_install.message': 'Select',
  'script': 'Kernel Version',
  'script.placeholder': 'Select Kernel script',
  'pos': 'The Installation Time',
  'pos.before': 'Before Installing the Kernel',
  'pos.after': 'After Installing the Kernel',
  'add.kernel': '+ Add Kernel Scripts',
  // message success
  'copy.success': 'Copy successful!',

  // build kernel form
  'code_repo': 'Code Repos',
  'code_repo.message': 'Select Code Repos',
  'code_repo.placeholder': 'Select',
  'code_branch': 'Code Branch',
  'code_branch.message': 'Select Code branch',
  'compile_branch': 'Compile Branch',
  'compile_branch.message': 'Select Compile Branch',
  'cpu_arch': 'CpuArch',
  'cpu_arch.message': 'Select CpuArch',
  'cpu_arch.placeholder': 'Select',
  'commit_id.placeholder': 'Enter',
  'build_config.placeholder': 'Enter Compile Branch',
  'build_machine.placeholder': 'Enter Compile Branch',

};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})