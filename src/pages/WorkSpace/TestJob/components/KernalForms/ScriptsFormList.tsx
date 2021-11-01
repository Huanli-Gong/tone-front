import React from 'react'
import { Form , Row , Col , Input , Button, Radio , Divider } from 'antd'
import { DeleteFormListItem } from '../DeleteFormListItem'

export default ({ disabled = false } : any ) => {
    return (
        <Form.List name="scripts" >
            {
                ( fields , { add, remove }) => (
                    <>
                        <Divider style={{ margin : '8px 0'}} dashed/>
                        {
                            fields.map(
                                ( field , index ) => (
                                    <Row key={field.key}>
                                        <Col span={ 24 }>
                                            <Form.Item 
                                                label="内核脚本" 
                                                name={[ field.name, "script" ]} 
                                                wrapperCol={{ span : 17 }} 
                                                labelCol={{ span : 6 }} 
                                            >
                                                <Input.TextArea placeholder="请输入内核脚本内容" disabled={ disabled }/>
                                            </Form.Item>
                                            {
                                                ( !disabled && index > 0 ) && 
                                                <DeleteFormListItem 
                                                    position={{ right : 0 , top : 0 }}
                                                    remove={ remove }
                                                    field={ field }
                                                />
                                            }
                                            <Row>
                                                <Col span={ 18 } offset={ 6 } >
                                                    <Form.Item
                                                        label="安装时机"
                                                        name={[field.name, "pos"]}
                                                        style={{ marginBottom : 0 }}
                                                    >
                                                        <Radio.Group disabled={ disabled }>
                                                            <Radio value="before">安装内核前</Radio>
                                                            <Radio value="after">安装内核后</Radio>
                                                        </Radio.Group>
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Divider style={{ margin : '8px 0 5px' }} dashed/>
                                    </Row>
                                )
                            )
                        }
                        {
                            !disabled &&
                            <Form.Item 
                                label=" "
                                labelCol={{ span : 6 }}
                                style={{ marginBottom : 0 }}
                            >
                                <Button 
                                    type="link" 
                                    onClick={ () => add({ pos : 'before' }) } 
                                    size="small"
                                    style={{ padding : 0 , fontSize : 12 }}
                                >
                                    + 添加内核脚本
                                </Button>
                            </Form.Item>
                        }
                    </>
                )
            }
        </Form.List>
    )
}