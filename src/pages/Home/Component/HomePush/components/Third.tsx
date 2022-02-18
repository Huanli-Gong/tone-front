import React from 'react';
import { ReactComponent as Sec1 } from '@/assets/svg/home/sec_1.svg';
import { ReactComponent as Sec2 } from '@/assets/svg/home/sec_2.svg';
import { ReactComponent as Sec3 } from '@/assets/svg/home/sec_3.svg';
import { ReactComponent as Sec4 } from '@/assets/svg/home/sec_ci_package.svg';
import { ReactComponent as Sec5 } from '@/assets/svg/home/sec_5.svg';
import { ReactComponent as Sec6 } from '@/assets/svg/home/sec_6.svg';
import styles from './Third.less';

export default ({ style={}, }) => {
  
  return (
    <div className={styles['third_root']} style={style}>
        <h1 className={styles['third_header']}>产品特点</h1>
        <div className={styles['third_content']}>
            <div className={styles.row_item}>
              <div><Sec1 /></div>
              <p>一站式质量平台</p>
              <span>
                平台打通了测试准备、测试执行、测试分析、测试计划、测试报告、覆盖率检测、智能Bisect、智能巡检等流程全闭环，为社区研发提供一站式测试支撑
              </span>
            </div>

            <div className={styles.row_item}>
              <div><Sec2 /></div>
              <p>质量协作能力</p>
              <span>
              通过分布式的业务架构，Testfarm支持多企业、多团队的质量协作模式
              </span>
            </div>

            <div className={styles.row_item}>
              <div><Sec3 /></div>
              <p>数据分析能力</p>
              <span>
              平台提供了时序分析、对比分析，以及聚合生成测试报告的能力，在大量测试之后对数据进行分析以发现软件问题
              </span>
            </div>

            <div className={styles.row_item} style={{ width:192}}>
              <div><Sec4 /></div>
              <p>开源软件包CI服务</p>
              <span>
              社区开发者可以将自己的软件包(可来自代码托管平台如github/gitee/codeup等)注册到Testfarm, 平台会监控软件包的代码变更，一旦有变更则会立即触发测试，并将测试结果通知开发者，方便开源软件包引入
              </span>
            </div>

            <div className={styles.row_item}>
              <div><Sec5 /></div>
              <p>环境登陆调试服务</p>
              <span>
              社区开发者可以reserve测试环境并登陆，方便在测试环境中进行测试及debug
              </span>
            </div>

            <div className={styles.row_item}>
              <div><Sec6 /></div>
              <p>缺陷定位诊断服务</p>
              <span>
              对于发现的软件缺陷，平台可以提供缺陷的自动化定位诊断能力，可以发现引入缺陷的commit地址
              </span>
            </div>
        </div>
    </div>
  )

}