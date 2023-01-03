import React, { useEffect } from 'react'
import { Form, Radio, Select } from 'antd'
import ScriptsListForm from './ScriptsFormList'
import styles from './index.less'
import { itemLayout } from './untils'
import { FormInstance } from 'antd/lib/form'
import { useIntl, FormattedMessage } from 'umi'
import PackagesFormItem from "@/pages/SystemConf/KernelManage/components/PackagesFormItem"

type IProps = {
    kernelList: any[];
    kernel?: string
    form: FormInstance;
    disabled?: boolean;
    needScriptList?: boolean;
} & Record<string, any>

const PushForm: React.FC<IProps> = (props) => {
    const { kernelList = [], form, disabled = false, needScriptList = true } = props
    const { formatMessage } = useIntl()
    const handleKernelVersionChange = (version: any) => {
        const idx = kernelList.findIndex((i: any) => i.version === version)
        if (idx > -1) {
            const { version, kernel_packages } = kernelList[idx]
            form.setFieldsValue({
                kernel_version: version,
                kernel_packages
            })
        }
    }

    useEffect(() => {
        const obj = form.getFieldValue('kernel_info')
        if (obj && JSON.stringify(obj) !== '{}') {
            form.setFieldsValue({
                hotfix_install: obj?.hotfix_install,
                scripts: obj?.scripts
            })
        }
    }, [form])

    return (
        <Form.Item label=" ">
            <Form.Item className={styles.kernal_wrapper_styles}>
                <Form.Item
                    {...itemLayout}
                    label={<FormattedMessage id="kernel.form.kernel_version" />}
                    name="kernel_version"
                    rules={[{
                        required: true,
                        message: formatMessage({ id: 'kernel.form.kernel_version.message' })
                    }]}
                >
                    <Select
                        placeholder={formatMessage({ id: 'please.select' })}
                        onChange={handleKernelVersionChange}
                        disabled={disabled}
                        getPopupContainer={node => node.parentNode}
                    >
                        {
                            kernelList.map(
                                (item: any) => (
                                    <Select.Option
                                        key={item.id}
                                        value={item.version}
                                    >
                                        {item.version}
                                    </Select.Option>
                                )
                            )
                        }
                    </Select>
                </Form.Item>

                {/* package kernel devel headers */}
                {/* @ts-ignore */}
                <PackagesFormItem {...props} {...itemLayout} disabled={true} />
                {/* <PackageList {...props} /> */}
                {/* package kernel devel headers */}

                <Form.Item
                    {...itemLayout}
                    label="hotfix_install"
                    name="hotfix_install"
                    rules={[{
                        required: true,
                        message: formatMessage({ id: 'please.select' }),
                    }]}>
                    <Radio.Group disabled={disabled}>
                        <Radio value={true}><FormattedMessage id="operation.yes" /></Radio>
                        <Radio value={false}><FormattedMessage id="operation.no" /></Radio>
                    </Radio.Group>
                </Form.Item>
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

export default PushForm