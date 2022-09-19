import React, { memo , useEffect } from 'react'
import { Form, Input , Row , Col , message } from 'antd'
import ScriptsListForm from './ScriptsFormList'
import { itemLayout } from './untils'
import styles from './index.less'
import Clipboard from 'clipboard'
import { ReactComponent as CopyLink } from '@/assets/svg/TestResult/icon_link.svg'
import { useIntl, FormattedMessage } from 'umi'

export default memo(
    ({ disabled = false , needScriptList = true } : any ) => {
        const { formatMessage } = useIntl()
        useEffect(() => {
            const clipboardKernel = new Clipboard('.copy_link_icon_kernel')
            const clipboardDevel = new Clipboard('.copy_link_icon_devel' )
            const clipboardHeaders = new Clipboard('.copy_link_icon_headers' ) 
            clipboardKernel.on('success', function(e) {
                message.success(formatMessage({id: 'request.copy.success'}) )
                e.clearSelection();
            })
            clipboardDevel.on('success', function(e) {
                message.success(formatMessage({id: 'request.copy.success'}) )
                e.clearSelection();
            })
            clipboardHeaders.on('success', function(e) {
                message.success(formatMessage({id: 'request.copy.success'}) )
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

        const disabledStyles = disabled ? { backgroundColor: '#f5f5f5'} : {}

        return (
            <Form.Item label=" ">
                <Form.Item className={ styles.kernal_wrapper_styles }>
                    <Row style={{ position : 'relative' }}>
                        <Col span={ 24 }>
                            <Form.Item 
                                rules={[{ 
                                    required: true , message: formatMessage({id: 'kernel.form.kernel.package.message'})
                                }]} 
                                { ...itemLayout } 
                                label={<FormattedMessage id="kernel.form.kernel.package"/> }
                                name="kernel">
                                <Input className="kernel_copy" autoComplete="off" style={ disabledStyles } readOnly={ disabled }/>
                            </Form.Item>
                        </Col>
                        {
                            needCopyLink && 
                            <CopyLink data-clipboard-target=".kernel_copy" className="copy_link_icon_kernel" style={ copyLinkIconStyles } />
                        }
                    </Row>
                    <Row style={{ position : 'relative' }}>
                        <Col span={ 24 }>
                            <Form.Item 
                                rules={[{ 
                                    required : true , 
                                    message: formatMessage({id: 'kernel.form.devel.package.message'})
                                }]} { ...itemLayout } 
                                label={<FormattedMessage id="kernel.form.devel.package" />}
                                name="devel">
                                <Input className="devel_copy" autoComplete="off" style={ disabledStyles } readOnly={ disabled }/>
                            </Form.Item>
                        </Col>
                        {
                            needCopyLink && 
                            <CopyLink data-clipboard-target=".devel_copy" className="copy_link_icon_devel" style={ copyLinkIconStyles } />
                        }
                    </Row>
                    <Row style={{ position: 'relative' }}>
                        <Col span={ 24 }>
                            <Form.Item 
                                rules={
                                    [{ 
                                    required : true , 
                                    message : formatMessage({id: 'kernel.form.headers.package.message'})
                                }]} { ...itemLayout } 
                                label={<FormattedMessage id="kernel.form.headers.package" />}
                                name="headers">
                                <Input className="headers_copy" autoComplete="off" style={ disabledStyles } readOnly={ disabled }/>
                            </Form.Item>
                        </Col>
                        {
                            needCopyLink && 
                            <CopyLink data-clipboard-target=".headers_copy" className="copy_link_icon_headers" style={ copyLinkIconStyles } />
                        }
                    </Row>
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