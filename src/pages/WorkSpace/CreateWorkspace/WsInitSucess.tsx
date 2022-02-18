import React, { useEffect, useState } from 'react'
import { Layout, message,Button,Col } from 'antd';
import { ReactComponent as WsInitJob } from '@/assets/svg/ws_init_job.svg';
import { ReactComponent as WsInitSet } from '@/assets/svg/ws_init_set.svg';
import { ReactComponent as AddOwner } from '@/assets/svg/ws_init_add_owner.svg';
import { enterWorkspaceHistroy } from '@/services/Workspace'
import styles from './index.less'
import { history,useModel,useRequest } from 'umi'
import _ from 'lodash'
import { useClientSize } from '@/utils/hooks';


export default (props: any) => {
    const { ws_id } = props.match.params
    const { initialState } = useModel('@@initialState')
    useRequest(
        (p) => enterWorkspaceHistroy(p),
        {
            formatResult: response => response,
            defaultParams: [{ ws_id }],
        }
    )
    
    const { height: layoutHeight } = useClientSize()

    const data = [
        {
            icon: <WsInitJob />,
            title: '创建Job',
            desc: '准备好了吗，创建你的测试Job吧',
            // addDesc: '准备好了吗，创建你的测试Job吧',
            buttonText: '立即创建'
        },
        {
            icon: <WsInitSet />,
            title: 'Workspace设置',
            desc: '机器，Job类型，Test Suit，产品项目等配置',
            buttonText: '去设置'
        },
        {
            icon: <AddOwner />,
            title: '添加成员',
            desc: '添加成员到你的Workspace吧',
            buttonText: '立即添加'
        }
    ]
    const handleClick = (type:string) =>{
        if(type === '立即创建') {
            const id = _.get(initialState,'jobTypeList[0].id')
            history.push(`/ws/${ws_id}/test_job/${id}`)
        }
        if(type === '去设置') history.push(`/ws/${ws_id}/config`)
        if(type === '立即添加') history.push(`/ws/${ws_id}/config/member`)
        
    }

    return (
        <Layout.Content style={{ height: layoutHeight - 50 }}>
            <div style={{ minHeight: 520 }}>
                <div style={{ height: layoutHeight - 150, minHeight: 420 }} className={styles.init_sucess_box}>
                    <div className={`${styles.init_box} ${styles.init_success_box}`}>

                        <div className={styles.init_sucess_text}>
                            Workspace创建成功，现在你可以
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
                                                    <span>查看</span>
                                                    <span className={styles.create_doc} onClick={() => window.open(`${location.origin}/help_doc/1`)}>创建Job</span>
                                                    <span>帮助文档</span>
                                                </div>
                                            }
                                        </div>
                                        <Button className={styles.button} type={index < 2 ? "primary" : "default"} onClick={_.partial(handleClick, item.buttonText)} style={{ color: index < 2 ? '#fff' : 'rgba(0,0,0,0.65)' }}>{item.buttonText}</Button>
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
