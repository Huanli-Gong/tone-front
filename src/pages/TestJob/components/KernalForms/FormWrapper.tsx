import React , { useImperativeHandle } from 'react'
import { Form } from 'antd'
import styles from './index.less'

export default ({ onRef , children , name } : any ) => {
    const [ form ] = Form.useForm()

    useImperativeHandle(
        onRef,
        () => ({ form })
    )

    return (
        <Form 
            form={ form }
            name={ name }
            colon={ false }
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            /*hideRequiredMark*/
            size="middle"
            className={ styles.job_test_form }
            initialValues={{
                scripts : [{}]
            }}
        >
            { children }
        </Form>
    )
}