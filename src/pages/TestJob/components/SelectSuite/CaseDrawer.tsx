import React, { useState, useImperativeHandle , useRef , useMemo } from 'react';
import { Drawer, Button, Input, Form, Space, InputNumber, Radio, Spin , Alert } from 'antd';
import styles from './style.less';
import Tooltip from 'antd/es/tooltip';

import ServerFormItem from './ServerFormItem'
import { QusetionIconTootip , getHasMuiltip } from '../untils'
import _ from 'lodash'

const SelectDrawer: React.FC<any> = ({ onRef, submitCase, ws_id, control, checked , test_type , server_type , run_mode }) => {
    const [ form ] = Form.useForm();
    const [ show, setShow ] = useState<boolean>(false)
    const [ batch, setBatch ] = useState<boolean>(false)
    const [ loading , setLoading ] = useState( true )
    const [ serverItem , setServerItem ] = useState<any>({})
    const [ data , setData ] = useState<any>({})
    const _caseBatchInfo : any  = { 
        priority : [] , need_reboot : [] , cleanup_info : [] , setup_info : [] , 
        console : [] , monitor : [] , custom_ip : [] , custom_channel : [] , 
        repeat : [] , server_object_id : [] , server_tag_id : [], ip: [],
        is_instance : []
    }
    const [ caseFrom , setCaseForm ] = useState<any>( null )

    const [ isNullEnv , setIsNullEnv ] = useState( false )

    const serverItemRef : any = useRef( null )

    useImperativeHandle(onRef, () => ({
        openDrawer: ( row?: any ) => {
            const isBatchOpt = _.isArray( row )
            setBatch( isBatchOpt )
            setData( row )
            const initialValues = {
                repeat : test_type === 'performance' ? 3 : 1,
                need_reboot: false,
                setup_info: '',
                cleanup_info: '',
                console: true,
                priority: 10,
            }
            if ( !isBatchOpt ) {
                let params: any = { ...initialValues , ...row }
                if (row.console == undefined) params.console = true
                const { env_info } = row 
                if ( env_info && env_info.length === 0 ) {
                    params.env_info = new Array(1).fill({ val : '' , name : '' })
                    setIsNullEnv( true )
                }
                form.setFieldsValue( params )
            } 
            else {
                let caseBatchInfo = { ..._caseBatchInfo }
                const params : any = {}
                row.forEach(( child : any ) => {
                    const { 
                        priority , need_reboot , setup_info , cleanup_info , ip , console : Console ,
                        monitor , custom_channel , custom_ip , repeat , server,
                        is_instance
                    } = child 
                    priority         && caseBatchInfo.priority.push( priority )
                    need_reboot      && caseBatchInfo.need_reboot.push( need_reboot )
                    setup_info       && caseBatchInfo.setup_info.push( setup_info )
                    cleanup_info     && caseBatchInfo.cleanup_info.push( cleanup_info )
                    Console          && caseBatchInfo.console.push( Console )
                    monitor          && caseBatchInfo.monitor.push( monitor )
                    custom_ip        && caseBatchInfo.custom_ip.push( custom_ip )
                    custom_channel   && caseBatchInfo.custom_channel.push( custom_channel)
                    repeat           && caseBatchInfo.repeat.push( repeat )
                    server.ip && caseBatchInfo.server_object_id.push( server.ip )
                    server.tag    && caseBatchInfo.server_tag_id.push( server.tag )
                    is_instance === 0 || is_instance === 1 && caseBatchInfo.is_instance.push( is_instance )

                    caseBatchInfo.ip.push( ip || '随机' )
                })


                Object.keys( caseBatchInfo ).map(
                    key => {
                        const result = Array.from( new Set(caseBatchInfo[ key ] ))
                        if ( result.length === 1 ) {
                            if ( key !== 'custom_channel' )
                                params[ key ] = result[ 0 ] 
                        }
                        caseBatchInfo[key] = result
                    }
                )

                setCaseForm( caseBatchInfo )
                params.env_info = new Array(3).fill({ val : '' , name : '' })
                form.setFieldsValue( params )
            }
            setShow(true)
            setLoading( false )
        }
    }));

    const handleServerItemChange = ( values : any ) => {
        setServerItem( values )
    }

    const onSubmit = () => {
        if ( loading ) return 
        setLoading( true )
        if ( serverItem.serverType === 2 && serverItem.validate === 'error' ) {
            setLoading( false )
            return
        }
        form 
            .validateFields()
            .then(
                val => {
                    const { 
                        env_info = [] , need_reboot , setup_info , cleanup_info , repeat ,
                        console : Console , priority , server_tag_id , server_object_id ,
                    } = val
                    const { title , key , id , name } = data
                    
                    let params : any = batch ? {} : { title , key , id , env_info , name }
                    
                    if ( need_reboot ) params.need_reboot = need_reboot
                    if ( setup_info ) params.setup_info = setup_info
                    if ( cleanup_info ) params.cleanup_info = cleanup_info
                    if ( Console ) params.console = Console
                    if ( priority ) params.priority = priority
                    if ( repeat ) params.repeat = repeat

                    if ( serverItem ) {
                        const { serverType , serverObjectType , is_instance } = serverItem 
                        if ( serverType === 1 ) {
                            if ( serverObjectType === 1 ) //suiji
                                params.ip = '随机'
                            if ( serverObjectType === 2 || serverObjectType > 3) {
                                params.ip = serverItem.ip
                                params.server_object_id = server_object_id
                                params.is_instance = is_instance
                            }
                            if ( serverObjectType === 3 ) {
                                params.server_tag_id = server_tag_id
                                params.ip = serverItem.tags
                            }
                        }

                        if ( serverType === 2 ) {
                            if ( val.custom_channel && val.custom_ip ) {
                                params.custom_ip = val.custom_ip
                                params.custom_channel = val.custom_channel
                                params.ip = val.custom_ip
                            }
                        }
                    }
                    submitCase( params , batch )
                    setLoading( false )
                    handleClose()
                }
        )
        .catch ( err => {
            console.log( err )
            setLoading( false )
        })
    }

    const handleClose = () => {
        setShow( false )
        form.resetFields()
        setBatch( false )
        setData({})
        setServerItem({})
        setCaseForm( _caseBatchInfo )
        setIsNullEnv( false )
    }

    const caseHasMuiltip = useMemo(() => {
        return getHasMuiltip( caseFrom )
    } , [ caseFrom ])

    return (
        <Drawer 
            maskClosable={ false }
            keyboard={ false }
            className={styles.case_drawer}
            title={
                <div>
                    <div>{`${batch ? '批量' : ''}配置Test Conf`}</div>
                    {
                        !batch && 
                        <div style={{ fontSize : 12 , color : 'rgba(0,0,0,.65)' , marginTop : 4 }}>{ data.name }</div>
                    }
                </div>
            }
            width={376}
            forceRender={true}
            destroyOnClose={true}
            onClose={ handleClose }
            visible={show}
            bodyStyle={{ paddingBottom: 80 , overflowX : "hidden" }}
            footer={
                <div style={{ textAlign: 'right', padding: '0 8px' }} >
                    <Button onClick={ handleClose } style={{ marginRight: 8 }}>
                        取消
                    </Button>
                    <Button onClick={onSubmit} type="primary">
                        确定
                    </Button>
                </div>
            }
        >
            <Spin spinning={ loading } >
                <Form 
                    layout="vertical" 
                    form={ form } 
                    /*hideRequiredMark*/
                    className={ styles.case_form }
                    scrollToFirstError
                >
                    {caseHasMuiltip && (
                        <div style={{ padding : '0 20px 8px' }}>
                            <Alert message="显示多个数值，输入新值覆盖所有，不输入则保留原值" type="warning" showIcon style={{ fontSize : 12 , padding : '5px 10px' }}/>
                        </div>
                    )}
                    <ServerFormItem 
                        onRef={ serverItemRef }
                        ws_id={ ws_id }
                        server_type={ server_type }
                        test_type={ test_type }
                        form={ form }
                        run_mode={ run_mode }
                        show={ show }
                        loading={ loading }
                        setLoading={ setLoading }
                        dataSource={ data }
                        batch={ batch }
                        caseFrom={ caseFrom }
                        onChange={ handleServerItemChange }
                    />

                    {(control.indexOf('variable') > -1 && checked ) &&
                            <Form.Item label="变量" className={ styles.drawer_padding }>
                                <Form.List name="env_info">
                                    {(fields, { add, remove }) => (
                                            fields.map((field, index) => {
                                                const evn = form.getFieldValue('env_info')
                                                return (
                                                    <Space key={field.key} style={{ marginBottom: 8 }} align="start">
                                                        <Tooltip title={ evn[ index ].des }>
                                                            <Form.Item
                                                                name={[field.name, 'name']}
                                                                fieldKey={[ field.fieldKey, 'name' ]}
                                                            >
                                                                <Input disabled={ true } autoComplete="off" placeholder={ 'key' } />
                                                            </Form.Item>
                                                        </Tooltip>
                                                        <span>=</span>
                                                        <Form.Item
                                                            name={[field.name, 'val']}
                                                            fieldKey={[field.fieldKey, 'val']}
                                                        >
                                                            <Input disabled={ isNullEnv } autoComplete="off" placeholder={ evn[ index ].des || "值" } />
                                                        </Form.Item>
                                                    </Space>
                                                )
                                            })
                                        )
                                    }
                                </Form.List>
                            </Form.Item>
                    }
                    {(control.indexOf('reboot') > -1 && checked) && (
                            <Form.Item
                                name="need_reboot"
                                label="执行前重启"
                                className={ styles.drawer_padding }
                                // rules={[{ required: true, message: '请选择' }]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>是</Radio>
                                    <Radio value={false}>否</Radio>
                                </Radio.Group>
                            </Form.Item>
                    )}
                    {( control.indexOf('script') > -1 && checked ) &&
                        <>
                            <Form.Item
                                name="setup_info"
                                label="执行前脚本"
                                className={ styles.drawer_padding }
                            >
                                <Input.TextArea rows={4} placeholder="请输入" />
                            </Form.Item>
                            <Form.Item
                                name="cleanup_info"
                                label="执行后脚本"
                                className={ styles.drawer_padding }
                            >
                                <Input.TextArea rows={4} placeholder="请输入" />
                            </Form.Item>
                        </>
                    }
                    {
                        ( control.indexOf('monitor') > -1 && checked ) &&
                            <Form.Item
                                name="console"
                                label="监控配置"
                                className={ styles.drawer_padding }
                                // rules={[{ required: true, message: '请选择' }]}
                            >
                                <Radio.Group>
                                    <Radio value={true}>是</Radio>
                                    <Radio value={false}>否</Radio>
                                </Radio.Group>
                            </Form.Item>
                    }
                    {
                        <Form.Item
                            name="priority"
                            label={ <QusetionIconTootip title="执行优先级" desc="执行优先级范围1-20"/> }
                            // rules={[{ required: true, message: '请输入' }]}
                            className={ styles.drawer_padding }
                        >
                            <InputNumber 
                                style={{ width: '100%' }} min={0} step={1} max={ 20 } 
                                placeholder={ caseFrom?.priority.length > 1 ? '多个数值' : '请输入' } 
                            />
                        </Form.Item>
                    }
                </Form>
            </Spin>
        </Drawer >
    );
};

export default SelectDrawer;