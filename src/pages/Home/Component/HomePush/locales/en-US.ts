const defaultKey = 'pages.home.push'

const text =  {
  // page1
  'system.introduction': 'T-One Platform Introduction',
  'brief.introduction': "There are many categories of testing and test environment is extremely complex, so how can it be easily automated? The answer is T-one, which is the first one-stop quality collaboration platform of all scenarios in the industry, can meet all your automation testing requirements.",
  'li.use1': 'Support multi CPU hybrid architecture (X86/Arm/Loogarch/Risc-v)',
  'li.use2': 'Support multi operating system categories (AnolisOS/CentOS/Debian/Ubuntu/Uniontech/KylinOS)',
  'li.use3': 'Support complex testing environment (Enterprise intranet/Network isolation environment/Elastic cloud virtual machine/Container/Application cluster/multiple hybrid environment)',
  // page2
  'platform': 'Platform Architecture',
  'project': 'Project Data',
  'analysis': 'Data Analysis',
  'offline': 'Offline Mode',
  'authentication': 'Data Authentication',

  'manage': 'Management Platform',
  'test.execution': 'Test Execution',
  'test.plan': 'Test Plan',
  'test.analysis': 'Test Analysis',
  'test.report': 'Test Report',
  'case.certification': 'Case Integration Certification',
  'test.manage': 'Test Process Management',
  'ws.manage': 'Workspace Management',
  'master.push': 'Master Push',
  'notice': 'Notification',
  'authority': 'Permission',

  'distributed.tasks.engine': 'Distributed Task Execution Engine',
  'func.and.perf': 'Function/Performance Test',
  'single.and.multi': 'Test in Single-machine/Multi-machine',
  'application.cluster': 'Test in Cluster',
  'cloud': 'Test in Cloud',
  'tasks.scheduling': 'Distributed Task Scheduling',
  'process.engine': 'DAG Process Engine',
  'machine.scheduling': 'Machine Scheduling',
  'message': 'Message',
  'event': 'Event',

  'active.mode': '(Active Mode)',
  'passive.mode': '(Passive Mode)',
  'test.framework': 'Test Machine Pool   Tone Test framework',
  'support.env': 'Support Intranet, cloud, isolation and other multi environment, e.g. phy/vm/docker/...',
  // page3
  'product.features': 'Product Features',
  'quality.platform': 'One-stop Quality Platform',
  'quality.platform.info': 'The platform creates a closed-loop flow including test preparation, test execution, test analysis, test plan, test report, coverage detection, intelligent bisect, intelligent patrol inspection, and provides one-stop test support for research and development in communities',
  'quality.collaboration': 'Quality Collaboration Capability',
  'quality.collaboration.info': 'Testfarm supports the multi-teams and multi-enterprises quality cooperation mode with the distributed business architecture',
  'data.analysis': 'Data Analysis Capability',
  'data.analysis.info': 'The platform provides the ability of timing analysis, contrastive analysis and aggregated test reports, and detects software bugs by data analyzing for numerous tests',
  'ci.services': 'Open Source Package CI Service',
  'ci.services.info': 'Developers of community can register their own software packages (from any code repository hosting service such as github/gitee/codeup) to Testfarm. The platform will monitor code changes of software packages. The test will be triggered immediately once code changes and the test results will be notified to developers, which facilitates the introduction of open source software packages',
  'env.login.debugger': 'Environment Login Debugging Service',
  'env.login.debugger.info': 'Developers of community can reserve and log in to test environment, which facilitates testing and debugging in test environment',
  'defect.location': 'Defect Location amd Diagnosis Service',
  'defect.location.info': 'This platform provides the ability of automatic defect location and diagnosis, and identify the code commit of introducing the defect',
  // page4
  'application.scenarios': 'Application Scenarios',
  'release.test': 'Release Test',
  'release.test.info': 'Every time AnolisOS is released, the community test team will conduct large-scale tests according to the released test strategy to ensure the product release quality. External users can view the release tests in the Testfarm.',
  'open.source.ci': 'Open Source Package CI',
  'open.source.ci.info': 'Open source software package CI: community developers can register the software package to the platform. The platform will automatically monitor the changes of the software package. Once changes occur, it will immediately test and push the test results.',
  'custom.test': 'Custom Testing',
  'custom.test.info': 'Custom testing: community developers can test on the t-one platform according to their own needs. They can submit test tasks directly through the page or use the API to submit test tasks.',
  'offline.test': 'Offline Test',
  'offline.test.info': 'Offline test: For the test environment inaccessible to the network, users can use the offline test mode to test and upload data.',
  'independent.deploy': 'Independent Deployment', 
  'independent.deploy.info': 'Independent deployment: External users can also deploy the platform independently in their own environment, test and upload data to Testfarm.',
  // 'test.plan': '测试计划',
  'test.plan.info': 'For periodic or large-scale test tasks that are expected to be executed according to the agreed plan, the test plan function can be used to plan in advance, and the platform will execute the test according to the given plan.',

};

export default Object.keys(text).reduce((p, key) => {
  p[`${defaultKey}.${key}`] = text[key]
  return p
}, {})