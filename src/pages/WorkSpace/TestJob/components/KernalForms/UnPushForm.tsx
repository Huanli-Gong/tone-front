import React from 'react'
import { Form } from 'antd'
import ScriptsListForm from './ScriptsFormList'
import styles from './index.less'
import type { FormInstance } from 'antd'
import PackagesFormItem from "@/pages/SystemConf/KernelManage/components/PackagesFormItem"
import { itemLayout } from './untils'

type IProps = {
    disabled?: boolean;
    needScriptList?: boolean;
    form?: FormInstance
}

const UnPush: React.FC<IProps> = (props) => {
    const { disabled = false, needScriptList = true, form } = props

    return (
        <Form.Item label=" ">
            <Form.Item className={styles.kernal_wrapper_styles}>

                {/* package kernel devel headers */}
                {/* @ts-ignore */}
                {/* <PackageList {...props} /> */}
                <PackagesFormItem {...props} {...itemLayout} />
                {/* package kernel devel headers */}

                {
                    needScriptList &&
                    <ScriptsListForm
                        form={form}
                        disabled={disabled}
                    />
                }
            </Form.Item>
        </Form.Item>
    )
}

export default UnPush