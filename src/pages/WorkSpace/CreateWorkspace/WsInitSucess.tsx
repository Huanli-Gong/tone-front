import React from 'react'
import { Layout, Button } from 'antd';
import { ReactComponent as WsInitJob } from '@/assets/svg/ws_init_job.svg';
import { ReactComponent as WsInitSet } from '@/assets/svg/ws_init_set.svg';
import { ReactComponent as AddOwner } from '@/assets/svg/ws_init_add_owner.svg';
import styles from './index.less'
import { history, useModel, FormattedMessage } from 'umi'
import _ from 'lodash'
import { useClientSize } from '@/utils/hooks';


export default (props: any) => {
    const { ws_id } = props.match.params
    const { initialState } = useModel('@@initialState')

    const { height: layoutHeight } = useClientSize()

    const data = [
        {
            icon: <WsInitJob />,
            title: <FormattedMessage id="workspace.create.job" />,
            desc: <FormattedMessage id="workspace.create_now.desc" />,
            buttonText: '立即创建',
            type: 'create_now',

        },
        {
            icon: <WsInitSet />,
            title: <FormattedMessage id="workspace.ws.set" />,
            desc: <FormattedMessage id="workspace.to_set.desc" />,
            buttonText: '去设置',
            type: 'to_set',
        },
        {
            icon: <AddOwner />,
            title: <FormattedMessage id="workspace.add.member" />,
            desc: <FormattedMessage id="workspace.add_now.desc" />,
            buttonText: '立即添加',
            type: 'add_now',
        }
    ]
    const handleClick = (type: string) => {
        if (type === '立即创建') {
            const id = _.get(initialState, 'jobTypeList[0].id')
            history.push(`/ws/${ws_id}/test_job/${id}`)
        }
        if (type === '去设置') history.push(`/ws/${ws_id}/config`)
        if (type === '立即添加') history.push(`/ws/${ws_id}/config/member`)

    }

    return (
        <Layout.Content style={{ height: layoutHeight - 50 }}>
            <div style={{ minHeight: 520 }}>
                <div style={{ height: layoutHeight - 150, minHeight: 420 }} className={styles.init_sucess_box}>
                    <div className={`${styles.init_box} ${styles.init_success_box}`}>

                        <div className={styles.init_sucess_text}>
                            <FormattedMessage id="workspace.create.success" />
                        </div>
                        <ul className={styles.init_sucess_opreate}>
                            {
                                data.map((item, index) => <li >
                                    <div className={styles.icon}>{item.icon}</div>
                                    <div>
                                        <div style={{ minHeight: 66 }}>
                                            <div className={styles.title}>{item.title}</div>
                                            <div className={styles.desc}>{item.desc}</div>
                                            {
                                                index === 0 && <div className={styles.last_line}>
                                                    <span><FormattedMessage id="operation.view" /></span>
                                                    <span className={styles.create_doc} onClick={() => window.open(`${location.origin}/help_doc/1`)}><FormattedMessage id="workspace.create.job" /></span>
                                                    <span><FormattedMessage id="menu.HelpDoc" /></span>
                                                </div>
                                            }
                                        </div>
                                        <Button className={styles.button} type={index < 2 ? "primary" : "default"} onClick={_.partial(handleClick, item.buttonText)} style={{ color: index < 2 ? '#fff' : 'rgba(0,0,0,0.65)' }}><FormattedMessage id={`workspace.${item.type}`} /></Button>
                                    </div>
                                </li>)
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </Layout.Content>
    )
}
