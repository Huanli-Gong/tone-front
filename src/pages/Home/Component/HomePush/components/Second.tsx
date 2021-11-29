import React from 'react';
import styles from './Second.less';

export default ({ style={}, }) => {

  const ArrowUp = () => (
    <div className={styles['arrow-content']}>
      <span className={styles['arrow-up']}></span>
      <span className={styles['arrow-up']}></span>
    </div>
  )
  
  return (
    <div className={styles['second-root']} style={style}>
        <h1 className={styles['second-header']}>平台架构</h1>
        <div className={styles['second-content']}>
          {/** 第一行 */}
          <div className={styles.row}>
            <div className={styles.left}>
              <div className={styles.project} style={{height: 68}}>
                <div>TestFarm</div>
              </div>
              <div className={styles.bridge}>
                <div className={styles.globule}></div>
                <div className={styles.line}></div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.menuItem}>Dashboard</div>
              <div className={styles.menuItem}>项目数据</div>
              <div className={styles.menuItem}>数据分析</div>
              <div className={styles.menuItem}>离线模式</div>
              <div className={styles.menuItem}>数据认证</div>
            </div>
          </div>
          {/** 第二行 */}
          <div className={styles.row}>
            <div className={styles.left}>
              <div className={styles.project} style={{height: 112,position: 'relative'}}>
                <div>T-One</div>
                <div>管理平台</div>
                <ArrowUp />
              </div>
              <div className={styles.bridge}>
                <div className={styles.globule}></div>
                <div className={styles.line}></div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.menu}>
                <div className={styles.menu_content}>
                  <div className={styles.menuItem}>测试执行</div>
                  <div className={styles.menuItem}>测试计划</div>
                  <div className={styles.menuItem}>测试分析</div>
                  <div className={styles.menuItem}>测试报告</div>
                </div>
                <div className={styles.menu_content} style={{marginTop: 10,}}>
                  <div className={styles.menuItem}>用例集成认证</div>
                  <div className={styles.menuItem}>测试流程管理</div>
                  <div className={styles.menuItem}>Workspace管理</div>
                  <div className={styles.menuItem}>Master推送</div>
                </div>
              </div>
              <div>
                <div className={styles.menuItem}>
                  <p>API</p>
                  <p>通知</p>
                  <p>权限</p>
                </div>
              </div>
            </div>
          </div>

          {/** 第三行 */}
          <div className={styles.row}>
            <div className={styles.left}>
              <div className={styles.project} style={{height: 112}}>
                <div>tone-runner</div>
                <div>分布式任务执</div>
                <div>行引擎</div>
              </div>
              <div className={styles.bridge}>
                <div className={styles.globule}></div>
                <div className={styles.line}></div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.menu}>
                <div className={styles.menu_content}>
                  <div className={styles.menuItem}>功能、性能测试</div>
                  <div className={styles.menuItem}>单机、多机测试</div>
                  <div className={styles.menuItem}>业务测试</div>
                  <div className={styles.menuItem}>云上测试</div>
                </div>
                <div className={styles.menu_content} style={{marginTop: 10}}>
                  <div className={styles.menuItem}>分布式任务调度</div>
                  <div className={styles.menuItem}>DAG流程引擎</div>
                  <div className={styles.menuItem}>Tone wrapper</div>
                  <div className={styles.menuItem}>机器调度</div>
                </div>
              </div>
              <div>
                <div className={styles.menuItem}>
                  <p>消息</p>
                  <p>&emsp;</p>
                  <p>事件</p>
                </div>
              </div>
            </div>
          </div>

          {/** 第四行 */}
          <div className={styles.row4}>
            <div className={styles.row4_flex}>
              <div className={styles.menuItem} style={{width: 535}}>tone-agent<span>（主动模式）</span></div>
              <div className={styles.menuItem} style={{width: 535}}>tone-agent<span>（被动模式）</span></div>
            </div>
            <div className={styles.menuItem} style={{width: '100%'}}>
              <div>测试机器池   tone测试框架</div>
              <p>内网、云上、隔离等多环境支持  phy/vm/docker等</p>
            </div>
          </div>

        </div>
    </div>
  )

}