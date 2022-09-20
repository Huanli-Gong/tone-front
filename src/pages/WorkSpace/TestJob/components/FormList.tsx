import React from 'react'
import { Form , Row , Col , Input , Radio , Button } from 'antd'
import { useIntl, FormattedMessage } from 'umi';
import { DeleteFormListItem } from './DeleteFormListItem'

export default ( { label , listName , textName , disabled , radioName , buttonShow , buttonText , placeholder } : any ) => {
    const disabledStyles = disabled ? { backgroundColor: '#f5f5f5' } : {}
    return (
        <Form.Item label={ label }>
            <Form.List name={ listName }>
                {
                    ( fields , { add, remove }) => {
                        return (
                            <>
                                {
                                    fields.map(
                                        ( field , index ) => (
                                            <Row 
                                                key={ index }
                                                style={ 
                                                    ( !disabled && buttonShow ) ? 
                                                        { marginBottom : 8 } : 
                                                        { marginBottom : index !== fields.length - 1 ? 8 : 0 }
                                                }
                                            >
                                                <Col span={ 24 } style={{ position : 'relative' }}>
                                                    <Form.Item noStyle name={[ field.name, textName ]} >
                                                        <Input.TextArea style={ disabledStyles } readOnly={ disabled } placeholder={ placeholder } rows={label == '执行脚本' ? 4 : 2}/>
                                                    </Form.Item>
                                                    {
                                                        ( !disabled && index > 0 ) && 
                                                        <DeleteFormListItem 
                                                            remove={ remove }
                                                            field={ field }
                                                            position={{ right : -20 , top : 0 }}
                                                        />
                                                    }
                                                </Col>
                                                {
                                                    ( !disabled && buttonShow ) && 
                                                    <Form.Item 
                                                        label={<FormattedMessage id="job.form.execution.time" />}
                                                        style={{ marginBottom : fields.length - 1 === index ? 0 : 8 }} 
                                                        name={[ field.name, radioName ]} 
                                                    >
                                                        <Radio.Group disabled={ disabled }>
                                                            <Radio value="before"><FormattedMessage id="job.form.restart.before" /></Radio>
                                                            <Radio value="after"><FormattedMessage id="job.form.restart.after" /></Radio>
                                                        </Radio.Group>
                                                    </Form.Item>
                                                }
                                            </Row>
                                        )
                                    )
                                }
                                {
                                    ( !disabled && buttonShow ) && 
                                    <Button 
                                        type="link" 
                                        onClick={ () => add({ pos : 'before' }) } 
                                        style={{ padding : 0 , fontSize : 12 }}
                                        size="small"
                                    >
                                        { buttonText }
                                    </Button>
                                }
                            </>
                        )
                    }
                }
            </Form.List>
        </Form.Item>
    )
}