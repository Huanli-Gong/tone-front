import React, { memo , useEffect } from 'react'
import { Form, Input, Radio, Select , Row , Col , message } from 'antd'
import ScriptsListForm from './ScriptsFormList'
import styles from './index.less'
import { itemLayout } from './untils'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import Clipboard from 'clipboard'

export default memo(
    ({ kernelList = [] , form , disabled = false , needScriptList = true } : any ) => {
        const handleKernelVersionChange = ( version : any ) => {
            const idx = kernelList.findIndex(( i : any ) => i.version === version )
            if ( idx > -1 ) {
                form.setFieldsValue({
                    kernel_version : kernelList[ idx ].version,
                    kernel : kernelList[ idx ].kernel_link , 
                    headers : kernelList[ idx ].headers_link , 
                    devel : kernelList[ idx ].devel_link 
                })
            }
        }

        useEffect(() => {
            const clipboardKernel = new Clipboard('.copy_link_icon_kernel')
            const clipboardDevel = new Clipboard('.copy_link_icon_devel' )
            const clipboardHeaders = new Clipboard('.copy_link_icon_headers' ) 
            clipboardKernel.on('success', function(e) {
                message.success('复制成功')
                e.clearSelection();
            })
            clipboardDevel.on('success', function(e) {
                message.success('复制成功')
                e.clearSelection();
            })
            clipboardHeaders.on('success', function(e) {
                message.success('复制成功')
                e.clearSelection();
            })
            return () => {
                clipboardKernel.destroy()
                clipboardDevel.destroy()
                clipboardHeaders.destroy()
            }
        },[])
        
        const needCopyLink = window.location.pathname.indexOf('test_result') > -1
        const copyLinkIconStyles = { cursor : 'pointer' , position : 'absolute' , right : 0 , top : 5 }

        return (
            <Form.Item label=" ">
                <Form.Item className={ styles.kernal_wrapper_styles }>
                    <Form.Item 
                        { ...itemLayout } 
                        label="内核版本" 
                        name="kernel_version" 
                        rules={[{ required : true , message : '请选择内核版本' }]}
                    >
                        <Select 
                            placeholder="请选择" 
                            onChange={ handleKernelVersionChange } 
                            disabled={ disabled }
                            getPopupContainer={ node => node.parentNode } 
                        >
                            {
                                kernelList.map(
                                    ( item : any ) => (
                                        <Select.Option 
                                            key={ item.id } 
                                            value={ item.version } 
                                        >
                                            { item.version }
                                        </Select.Option>
                                    )
                                )
                            }
                        </Select>
                    </Form.Item>
                    <Row style={{ position : 'relative' }}>
                        <Col span={ 24 }>
                            <Form.Item { ...itemLayout } label="kernel包" name="kernel">
                                <Input className="kernel_copy" autoComplete="off" style={{ backgroundColor: '#f5f5f5'}}  readOnly={ true }/>
                            </Form.Item>
                        </Col>
                        {
                            needCopyLink && 
                            <CopyLink data-clipboard-target=".kernel_copy" className="copy_link_icon_kernel" style={ copyLinkIconStyles } />
                        }
                    </Row>
                    <Row style={{ position : 'relative' }}>
                        <Col span={ 24 }>
                            <Form.Item { ...itemLayout } label="devel包" name="devel" >
                                <Input className="devel_copy" autoComplete="off" style={{ backgroundColor: '#f5f5f5'}}  readOnly={ true }/>
                            </Form.Item>
                        </Col>
                        {
                            needCopyLink && 
                            <CopyLink data-clipboard-target=".devel_copy" className="copy_link_icon_devel" style={ copyLinkIconStyles } />
                        }
                    </Row>
                    <Row style={{ position : 'relative' }}>
                        <Col span={ 24 }>
                            <Form.Item { ...itemLayout } label="headers包" name="headers">
                                <Input className="headers_copy" autoComplete="off" style={{ backgroundColor: '#f5f5f5'}}  readOnly={ true }/>
                            </Form.Item>
                        </Col>
                        {
                            needCopyLink && 
                            <CopyLink data-clipboard-target=".headers_copy" className="copy_link_icon_headers" style={ copyLinkIconStyles } />
                        }
                    </Row>
                    <Form.Item { ...itemLayout } label="hotfix_install" name="hotfix_install" rules={[{ required : true , message : '请选择' }]}>
                        <Radio.Group disabled={ disabled }>
                            <Radio value={ true }>是</Radio>
                            <Radio value={ false }>否</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {
                        needScriptList &&
                        <ScriptsListForm 
                            disabled={ disabled }
                        />
                    }
                </Form.Item>
            </Form.Item>
        )
    }
)