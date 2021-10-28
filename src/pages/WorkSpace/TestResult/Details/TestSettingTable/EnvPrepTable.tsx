import React , { useEffect , useState } from 'react'
import { Card, Row , Empty , Space, Col , Button } from 'antd'

import styles from './index.less'

const renderLinkRow = (  name : string , _ : any ) => (
    _ && 
        <Row>
            <Col span={ 2 }><b>{ name }</b></Col>
            <Col span={ 22 }><a target="__blank" href={ _ }>{ _ }</a></Col>
        </Row>
)

const renderPackageSpan = ( name : string , link : any ) => {
    return <Button type="link" onClick={() => window.open( link )} style={{ padding : 0 , marginRight : 10 }}>{ name }</Button>
}

const renderDefaultRow = ( name : string  , _ : any ) => (
    _ && 
        <Row>
            <Col span={ 2 }><b>{ name }</b></Col>
            <Col span={ 22 }>{ _ }</Col>
        </Row>
)

export default ( props : any ) => {
    const [ data , setData ] = useState<any>({
        rpm_info : [],
        env_info : '',
        monitor_info : [],
        script_info : []
    })

    const [ isEmpty , setIsEmpty ] = useState( 0 )

    useEffect(() => {
        if ( JSON.stringify( props ) !== '{}' ) {
            const {
                env_info = '', monitor_info ,
                iclone_info = { os : '' , app_name : '' , vm : '' } , rpm_info = [], script_info = [],
                need_reboot, kernel_info
            } = props 

            let empty = 0;
            let envs : string = ''
            
            if ( env_info && JSON.stringify( env_info ) !== '{}' ) {
                // envs = Object.keys( env_info ).reduce(( p , c ) => p.concat(`${ c }=${ env_info[ c ] };`), '')
                envs = Object.keys( env_info ).map((item) => `${item}=${ env_info[ item ]}`).join()
            }
            else empty ++

            let monitors : any = []
            if ( monitor_info && monitor_info.length > 0 )
                monitors = monitor_info.map(( i : any ) => ({ server : i['ip/sn'], metric_category : i.metric_category }))
            else empty ++

            if ( !need_reboot ) empty ++
            if ( script_info.length == 0 ) empty ++
            if ( rpm_info.length == 0 ) empty ++
            if ( JSON.stringify( iclone_info ) === '{}' ) empty ++ 

            let kernelInfo = {}

            if ( kernel_info === '{}' ) empty ++ 
            
            if ( kernel_info && kernel_info !== '{}' ) kernelInfo = JSON.parse( kernel_info )

            let obj = { 
                env_info : envs,
                script_info ,
                monitor_info : monitors,
                rpm_info ,
                iclone_info,
                need_reboot,
                kernel_info : kernelInfo
            }

            setIsEmpty( empty )
            setData( obj )
        }
    }, [ props ])

    return (
        <Card 
            title="环境准备配置"
            bodyStyle={{ paddingTop : 0 }}
            headStyle={{ borderBottom : 'none' }}
            style={{ marginBottom : 10 }}
        >
            {
                isEmpty === 0 ?
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />:
                <table className={ styles.setting_info_table }>
                    <tbody>
                        {
                            JSON.stringify( data.iclone_info ) !== '{}' &&
                            <tr>
                                <td>重装机器</td>
                                <td>
                                    <Row><b>是</b></Row>
                                    {
                                        data.iclone_info.os &&
                                        <Row>
                                            <Space>
                                                <b>物理机</b>
                                                <span>{ `${ data.iclone_info.os }  ${ data.iclone_info.app_name }` }</span>
                                            </Space>
                                        </Row>
                                    }
                                    {
                                        data.iclone_info.vm &&
                                        <Row>
                                            <Space>
                                                <b>虚拟机</b>
                                                <span></span>
                                            </Space>
                                        </Row>
                                    }
                                </td>
                            </tr>
                        }
                        {
                            <tr>
                                <td>重装内核</td>
                                {
                                    JSON.stringify( data.kernel_info ) !== '{}' ?
                                        <td>
                                            { !data.kernel_info && <Row>不安装内核</Row> }
                                            { data.kernel_info && 'code_repo' in data.kernel_info && <Row><b>Build内核</b></Row> }
                                            { data.kernel_info && 'hotfix_install' in data.kernel_info && <Row><b>安装已发布</b></Row> }
                                            { ( data.kernel_info && !data.kernel_info.hotfix_install && !data.kernel_info.code_repo ) && <Row><b>安装未发布</b></Row> }
                                            { data.kernel_info.kernel_version && <span>{ data.kernel_info.kernel_version }</span>}
                                            { 'devel' in data.kernel_info && renderPackageSpan( 'devel包' , data.kernel_info.devel ) }
                                            { 'headers' in data.kernel_info && renderPackageSpan( 'headers包' , data.kernel_info.headers ) }
                                            { 'kernel' in data.kernel_info && renderPackageSpan( 'kernel包' , data.kernel_info.kernel ) }
                                            { 'hotfix_install' in data.kernel_info && renderDefaultRow( 'hotfix_install' , data.kernel_info.hotfix_install ? '是' : '否' )}
                                            { renderLinkRow( '代码仓库' , data.kernel_info.code_repo ) }
                                            { renderLinkRow( '代码分支' , data.kernel_info.code_branch ) }
                                            { renderLinkRow( '编译分支' , data.kernel_info.compile_branch ) }
                                            { renderDefaultRow( 'CpuArch' , data.kernel_info.cpu_arch ) }
                                            { renderDefaultRow( 'Commit ID' , data.kernel_info.commit_id ) }
                                            { renderDefaultRow( 'Build Config' , data.kernel_info.build_config ) }
                                            { renderDefaultRow( 'Build Machine' , data.kernel_info.build_machine ) }
                                            {
                                                ( data.kernel_info.scripts && data.kernel_info.scripts.length > 0 ) &&
                                                <Row>
                                                    <Col span={ 2 } ><b>内核脚本</b></Col>
                                                    <Col span={ 22 }>
                                                        {
                                                            data.kernel_info.scripts.map(
                                                                ( item : any , index : number ) => (
                                                                    <Row key={ index }>
                                                                        <Space>
                                                                            <b>{ item.pos === 'before' ? '重启前' : '重启后' }</b>
                                                                            <span>{ item.script }</span>
                                                                        </Space>
                                                                    </Row>
                                                                )
                                                            )
                                                        }
                                                    </Col>
                                                </Row>
                                            }
                                        </td> :
                                        <td><b>不安装</b></td> 
                                }
                            </tr>
                        }

                        {
                            <tr>
                                <td>重启机器</td>
                                <td>
                                    <b>{ data.need_reboot ? '是' : '否' }</b>
                                </td>
                            </tr>
                        }
                        {
                            data.env_info && 
                            <tr>
                                <td>全局变量</td>
                                <td>
                                    {data.env_info}
                                </td>
                            </tr>
                        }
                        {
                            data.rpm_info.length > 0 &&
                            <tr>
                                <td>安装RPM</td>
                                <td>
                                    {
                                        data.rpm_info.map(
                                            ( item : any , index : number ) => (
                                                <Row key={ index }>
                                                    <b>{ item.pos === 'before' ? '重启前' : '重启后' }</b>
                                                    <a target="__blank" href={ item.rpm }>{ item.rpm }</a>
                                                </Row>
                                            )
                                        ) 
                                    }
                                </td>
                            </tr>
                        }
                        {
                            data.script_info.length > 0 && 
                            <tr>
                                <td>执行脚本</td>
                                <td>
                                    {
                                        data.script_info.map(
                                            ( item : any , index : number ) => (
                                                <Row key={ index }>
                                                    <b>{ item.pos === 'before' ? '重启前' : '重启后' }</b>
                                                    <span>{ item.script }</span>
                                                </Row>
                                            )
                                        ) 
                                    }
                                </td>
                            </tr>
                        }
                        {
                            data.monitor_info.length > 0 && 
                            <tr>
                                <td>监控配置</td>
                                <td>
                                    {
                                        data.monitor_info.length > 0 && <b>是</b>
                                    }
                                    {
                                        data.monitor_info.map(
                                            ( item : any , index : number ) => (
                                                <>
                                                    <Row key={ index }><b>监控项</b><span>{ item.metric_category }</span></Row>
                                                    <Row key={ index }><b>监控机器</b><span>{ item.server }</span></Row>
                                                </>
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            }
        </Card>
    )
}