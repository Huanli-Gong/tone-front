import React, { useState, useImperativeHandle, useMemo } from 'react';
import { Drawer, Button, Input, Form, Space, Alert , InputNumber, Radio, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './style.less';

import ServerFormItem from './ServerFormItem'
import { QusetionIconTootip , getHasMuiltip } from '../untils'
import _ from 'lodash'

const SelectDrawer: React.FC<any> = ({ onRef, submitSuite, contrl , ws_id , test_type , server_type , run_mode }) => {
    const _suiteBatchInfo : any = { 
        priority : [] , need_reboot : [] , cleanup_info : [] , 
        setup_info : [] , console : [] , monitor : [] 
    }
    const _caseBatchInfo : any  = { 
        custom_ip : [] , custom_channel : [] , ip : [] ,
        repeat : [] , server_object_id : [] , server_tag_id : [],
        is_instance : []
    }
    const [ formSuite ] = Form.useForm();
    const [ show, setShow ] = useState<boolean>(false)
    const { Option } = Select;
    const [ dataSource, setDataSource ] = useState<any>( undefined )
    const [ serverItem , setServerItem ] = useState<any>({})
    const [ suiteForm , setSuiteForm ] = useState<any>( _suiteBatchInfo )
    const [ caseFrom , setCaseForm ] = useState<any>( _caseBatchInfo )
    const [ batch , setBatch ] = useState( false )
    const [ loading , setLoading ] = useState( true )

    useImperativeHandle(onRef, () => ({
        openDrawer: ( row : any ) => {
            setShow( true )
            setDataSource( row )
            const isBatchOption = _.isArray( row )
            setBatch( isBatchOption )
            let params: any = {}

            if ( isBatchOption ) {
                let suiteBatchInfo = { ..._suiteBatchInfo }
                let caseBatchInfo = { ..._caseBatchInfo }

                row.forEach(( el : any ) => {
                    const { priority , need_reboot , setup_info , cleanup_info , console : Console , monitor } = el

                    priority        && suiteBatchInfo.priority.push( priority )
                    need_reboot     && suiteBatchInfo.need_reboot.push( need_reboot )
                    setup_info      && suiteBatchInfo.setup_info.push( setup_info )
                    cleanup_info    && suiteBatchInfo.cleanup_info.push( cleanup_info )
                    Console         && suiteBatchInfo.console.push( Console )
                    monitor         && suiteBatchInfo.monitor.push( monitor )
                    
                    el.test_case_list.forEach(( child : any ) => {
                        const { custom_ip , custom_channel , server_tag_id , server_object_id , repeat , ip , is_instance } = child 
                        
                        caseBatchInfo.ip.push( ip || '随机' )
                        custom_ip           && caseBatchInfo.custom_ip.push( custom_ip )
                        custom_channel      && caseBatchInfo.custom_channel.push( custom_channel)
                        repeat              && caseBatchInfo.repeat.push( repeat )
                        server_tag_id       && caseBatchInfo.server_tag_id.push( server_tag_id )
                        server_object_id    && caseBatchInfo.server_object_id.push( server_object_id )
                        is_instance === 0 || is_instance === 1 && caseBatchInfo.is_instance.push( is_instance )
                    })
                })

                Object.keys( suiteBatchInfo ).map(
                    key => {
                        const result : any = Array.from( new Set(suiteBatchInfo[ key ] ) )
                        if ( result.length === 1 ) params[ key ] = result[ 0 ]
                        suiteBatchInfo[ key ] = result
                    }
                )

                Object.keys( caseBatchInfo ).forEach(
                    key => {
                        const result : any = Array.from( new Set(caseBatchInfo[ key ] ) )
                        if ( result.length === 1 ) params[ key ] = result[ 0 ]
                        caseBatchInfo[ key ] = result
                    }
                )
                
                setSuiteForm( suiteBatchInfo )
                setCaseForm( caseBatchInfo )

                if ( caseBatchInfo.repeat.length === 0 )  //空值 单值
                    params.repeat = test_type === 'performance' ? 3 : 1
                if ( suiteBatchInfo.priority.legnth === 0 ) 
                    params.priority = 10

                formSuite.setFieldsValue( params )
            }
            else {
                params = { ...row }
                if ( !row.console ) params.console = true
                formSuite.setFieldsValue( params )
            }
            setLoading( false )
        }
    }))

    const onSubmit = () => {
        if ( serverItem.serverType === 2 && serverItem.validate === 'error' ) {
            setLoading( false )
            return
        }
        formSuite
            .validateFields()
            .then(
                val => {
                    submitSuite( dataSource , val , serverItem , handleClose )
                }
            )
            .catch(( err ) => {
                console.log( err )
            })
    }

    const handleServerItemChange = ( values : any ) => {
        setServerItem( values )
    }

    const suiteHasMuiltip = useMemo(() => {
        return getHasMuiltip( suiteForm )
    } , [ suiteForm , caseFrom ])

    const caseHasMuiltip = useMemo(() => {
        return getHasMuiltip( caseFrom )
    } , [ caseFrom ])

    const handleClose = () => {
        setCaseForm( _caseBatchInfo )
        setSuiteForm( _suiteBatchInfo )
        setShow( false )
        setDataSource( undefined )
        setBatch( false )
        setLoading( true )
        setServerItem({})
        formSuite.resetFields()
    }

    return (
        <Drawer 
            maskClosable={ false }
            keyboard={ false }
            className={ styles.suite_drawer }
            title={ 
                <div>
                    <div>{`${ batch ? '批量' : ''}配置Test Suite`}</div>
                    {
                        ( !batch && dataSource ) && 
                        <div style={{ fontSize : 12 , color : 'rgba(0,0,0,.65)' , marginTop : 4 }}>{ dataSource.name }</div>
                    }
                </div>
            }
            width={376}
            forceRender={true}
            destroyOnClose={true}
            onClose={ handleClose }
            visible={ show }
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right', padding: '0 8px' }} >
                    <Button onClick={ handleClose } style={{ marginRight: 8 }}>
                        取消
                    </Button>
                    <Button onClick={ onSubmit } type="primary">
                        确定
                    </Button>
                </div>
            }
        >
            {
                ( suiteHasMuiltip && caseHasMuiltip ) &&
                <div style={{ padding : '12px 20px 0' }}>
                    <Alert message="显示多个数值，输入新值覆盖所有，不输入则保留原值" type="warning" showIcon style={{ fontSize : 12 , padding : '5px 10px' }}/>
                </div>
            }
            <Form 
                layout="vertical" 
                form={formSuite} 
                /*hideRequiredMark*/ 
                className={ styles.suite_form }
            >
                {
                    batch &&
                    <ServerFormItem 
                        ws_id={ ws_id }
                        server_type={ server_type }
                        test_type={ test_type }
                        form={ formSuite }
                        show={ show }
                        run_mode={ run_mode }
                        loading={ loading }
                        setLoading={ setLoading }
                        onChange={ handleServerItemChange }
                        itemType={ 'suite' }
                        batch={ batch }
                        caseFrom={ caseFrom }
                    />
                }
                {
                    contrl.includes('reboot') &&
                    <Form.Item
                        name="need_reboot"
                        label="执行前重启"
                        className={ styles.drawer_padding }
                    >
                        <Radio.Group>
                            <Radio value={true}>是</Radio>
                            <Radio value={false}>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                }
                {
                    contrl.includes('script') && 
                    <>
                        <Form.Item
                            name="setup_info"
                            label="执行前脚本"
                            className={ styles.drawer_padding }
                        >
                            <Input.TextArea rows={4} placeholder={ suiteForm.setup_info.length > 1 ? '已配置多种脚本' : '请输入脚本内容' } />
                        </Form.Item>
                        <Form.Item
                            name="cleanup_info"
                            label="执行后脚本"
                            className={ styles.drawer_padding }
                        >
                            <Input.TextArea rows={4} placeholder={ suiteForm.cleanup_info.length > 1 ? '已配置多种脚本' : '请输入脚本内容' } />
                        </Form.Item>
                    </>
                }
                {
                    contrl.includes('monitor') &&
                    <>
                        <Form.Item
                            name="console"
                            label="监控配置"
                            className={ styles.drawer_padding }
                        >
                            <Radio.Group >
                                <Radio value={true}>是</Radio>
                                <Radio value={false}>否</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.List name="monitor_info" >
                            {(fields, { add, remove }) => {
                                return (
                                    <div 
                                        className={ styles.drawer_padding }
                                    >
                                        {fields.map((field, index) => (
                                            <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                                                <Form.Item
                                                    label={null}
                                                    {...field}
                                                    name={[field.name, 'items']}
                                                    fieldKey={[field.fieldKey, 'items']}
                                                >
                                                    <Select style={{ width: 140 }} placeholder={ suiteForm.console.length > 1 ? '多个数值' : '请选择监控项' } >
                                                        <Option value="1" >数据监控</Option>
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    label={null}
                                                    {...field}
                                                    name={[field.name, 'servers']}
                                                    fieldKey={[field.fieldKey, 'servers']}
                                                >
                                                    <Select style={{ width: 140 }} placeholder={ suiteForm.console.length > 1 ? '多个数值' : '请选择监控机器' } >
                                                        <Option value="1" >机器一</Option>
                                                    </Select>
                                                </Form.Item>
                                                {
                                                    ( index !== 0 && fields.length > 1 ) ?
                                                    <DeleteOutlined
                                                        className="dynamic-delete-button"
                                                        style={{ margin: '8px 0' }}
                                                        onClick={() => {
                                                            remove(field.name);
                                                        }}
                                                    /> :
                                                    <div style={{ width: '14px' }}> </div>
                                                }
                                            </Space>
                                        ))}
                                        <Button
                                            style={{ width: 100, padding: 0, textAlign: 'left', marginBottom: 8 }}
                                            type="link"
                                            size="small"
                                            block
                                            onClick={() => {
                                                add();
                                            }}
                                        >
                                            + 添加一组监控
                                        </Button>
                                    </div>
                                );
                            }}
                        </Form.List>
                    </>
                }
                {
                    <Form.Item
                        name="priority"
                        // label="执行优先级"
                        label={ <QusetionIconTootip title="执行优先级" desc="执行优先级范围1-20"/> }
                        className={ styles.drawer_padding }
                    >
                        <InputNumber 
                            style={{ width: '100%' }} min={0} step={1} max={ 20 } 
                            placeholder={ suiteForm?.priority.length > 1 ? '多个数值' : '请输入' } 
                        />
                    </Form.Item>
                }
            </Form >
        </Drawer >
    );
};

export default SelectDrawer;
