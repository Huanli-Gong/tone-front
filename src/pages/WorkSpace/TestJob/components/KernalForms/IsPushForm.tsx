import React from 'react'
import { Form, Radio, Select } from 'antd'
import ScriptsListForm from './ScriptsFormList'
import styles from './index.less'
import { itemLayout } from './untils'
import { FormInstance } from 'antd/lib/form'
import { PackageList } from './PackageFormItem'
import { useIntl, FormattedMessage } from 'umi'

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
            form.setFieldsValue({
                kernel_version: kernelList[idx].version,
                kernel: kernelList[idx].kernel_link,
                headers: kernelList[idx].headers_link,
                devel: kernelList[idx].devel_link
            })
        }
    }

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
                <PackageList {...props} />
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
                        disabled={disabled}
                    />
                }
            </Form.Item>
        </Form.Item>
    )
}

export default PushForm