/* eslint-disable react-hooks/exhaustive-deps */


import React, { useEffect, useMemo, useState } from 'react'
import { Form, Input, Select } from 'antd'
import type { FormInstance } from "antd"
import ScriptsListForm from './ScriptsFormList'
import styles from './index.less'
import { itemLayout } from './untils'
import { useRequest, useIntl, FormattedMessage } from 'umi'
import { queryRepositoryProject } from '@/pages/WorkSpace/Product/services'
import { queryCbpProduct } from '../../services'

type IProps = {
    disabled?: boolean;
    needScriptList?: boolean;
    form?: FormInstance;
    project_id?: any;
    isPlan?: boolean;
}

const is_openanolis = BUILD_APP_ENV === "opensource"

const BuildKernelForm: React.FC<IProps> = (props) => {
    const { disabled, project_id, form, needScriptList, isPlan = false } = props
    const { formatMessage } = useIntl()
    const [codeBranch, setCodeBranch] = useState<any>(form?.getFieldValue('code_repo'))
    const { data = [], run } = useRequest(() =>
        queryRepositoryProject({ project_id }), { initialData: [], manual: true })
    const disabledStyles = disabled ? { backgroundColor: '#f5f5f5' } : {}

    const branches = useMemo(() => {
        for (const branch of data) {
            if (branch.repo_id === codeBranch)
                return branch.branch_dict
        }
        return []
    }, [codeBranch, data])

    useEffect(() => {
        if (!is_openanolis) {
            run()
            // form?.resetFields()
        }
    }, [project_id])

    const hanldeChangeCodeRepo = (val: any) => {
        setCodeBranch(val)
        form?.setFieldsValue({ code_branch: null })
    }

    const { data: cbpProductList } = useRequest(queryCbpProduct, { initialData: [], manual: !!BUILD_APP_ENV })

    const handleCbpSelectChange = (val: any) => {
        const idx = cbpProductList.findIndex((i: any) => i.id === val)
        const product = cbpProductList[idx]
        form?.setFieldsValue({
            code_repo: product.repo,
            code_branch: product?.current_branch,
            compile_branch: product.builder_branch
        })
    }

    return (
        <Form.Item label=" ">
            <Form.Item className={styles.kernal_wrapper_styles}>
                {
                    is_openanolis ?
                        <>
                            <Form.Item {...itemLayout}
                                label={<FormattedMessage id="kernel.form.code_repo" />}
                                name="code_repo"
                                rules={[{
                                    required: true,
                                    message: formatMessage({ id: 'kernel.form.code_repo.message' })
                                }]}>
                                <Select
                                    disabled={disabled}
                                    placeholder={formatMessage({ id: 'kernel.form.code_repo.placeholder' })}
                                    style={disabledStyles}
                                    onChange={hanldeChangeCodeRepo}
                                    allowClear
                                    showSearch
                                    filterOption={(input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                    options={
                                        data.map((item: any) => ({
                                            value: item.repo_id,
                                            label: item.repo_git_url
                                        }))
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                {...itemLayout}
                                label={<FormattedMessage id="kernel.form.code_branch" />}
                                name="code_branch"
                                rules={[{
                                    required: true,
                                    message: formatMessage({ id: 'kernel.form.code_branch.message' })
                                }]}>
                                <Select
                                    style={disabledStyles}
                                    disabled={disabled}
                                    showSearch
                                    allowClear
                                    placeholder={formatMessage({ id: 'kernel.form.code_branch.message' })}
                                    filterOption={(input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                    options={
                                        branches?.map((item: any) => ({
                                            value: item.id,
                                            label: item.name
                                        }))
                                    }
                                />
                            </Form.Item>
                        </> :
                        <>
                            <Form.Item
                                {...itemLayout}
                                label={formatMessage({ id: 'kernel.form.cbc.product' })}
                                name={isPlan ? "product_name" : "name"}
                                rules={[{ required: true, message: formatMessage({ id: 'kernel.form.cbc.product.empty' }) }]}
                            >
                                <Select
                                    disabled={disabled}
                                    placeholder={formatMessage({ id: 'kernel.form.cbc.product.empty' })}
                                    onChange={handleCbpSelectChange}
                                    filterOption={(input: string, option: any) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                    style={disabledStyles}
                                    allowClear
                                    showSearch
                                    options={
                                        cbpProductList?.map((product: any) => ({
                                            value: product.id,
                                            label: product.name
                                        }))
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                {...itemLayout}
                                label={<FormattedMessage id="kernel.form.code_repo" />}
                                name="code_repo"
                                rules={[{
                                    required: true,
                                    message: formatMessage({ id: 'kernel.form.code_repo.message' })
                                }]}
                            >
                                <Input
                                    style={disabledStyles}
                                    disabled={disabled}
                                    placeholder={formatMessage({ id: 'kernel.form.code_repo.placeholder' })}
                                />
                            </Form.Item>
                            <Form.Item
                                {...itemLayout}
                                label={<FormattedMessage id="kernel.form.code_branch" />}
                                name="code_branch"
                                rules={[{
                                    required: true,
                                    message: formatMessage({ id: 'kernel.form.code_branch.message' })
                                }]}>
                                <Input
                                    style={disabledStyles}
                                    disabled={disabled}
                                    placeholder={formatMessage({ id: 'kernel.form.code_branch.message' })}
                                />
                            </Form.Item>
                        </>
                }
                <Form.Item
                    {...itemLayout}
                    label={<FormattedMessage id="kernel.form.compile_branch" />}
                    name="compile_branch">
                    <Input style={disabledStyles} readOnly={disabled} autoComplete="off"
                        placeholder={formatMessage({ id: 'kernel.form.compile_branch.message' })}
                    />
                </Form.Item>
                <Form.Item
                    {...itemLayout}
                    label={<FormattedMessage id="kernel.form.cpu_arch" />}
                    name="cpu_arch"
                    rules={[{
                        required: true,
                        message: formatMessage({ id: 'kernel.form.cpu_arch.message' })
                    }]}>
                    <Select
                        disabled={disabled}
                        placeholder={formatMessage({ id: 'kernel.form.cpu_arch.placeholder' })}
                    >
                        <Select.Option value="x86_64">x86_64</Select.Option>
                        <Select.Option value="aarch64">aarch64</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    {...itemLayout}
                    label="Commit ID"
                    name="commit_id"
                >
                    <Input
                        style={disabledStyles}
                        readOnly={disabled}
                        autoComplete="off"
                        placeholder={formatMessage({ id: 'kernel.form.commit_id.placeholder' })}
                    />
                </Form.Item>
                <Form.Item {...itemLayout} label="Build Config" name="build_config">
                    <Input
                        style={disabledStyles}
                        readOnly={disabled}
                        autoComplete="off"
                        placeholder={formatMessage({ id: 'kernel.form.build_config.placeholder' })}
                    />
                </Form.Item>
                <Form.Item {...itemLayout} label="Build Server" name="build_machine">
                    <Input
                        style={disabledStyles}
                        readOnly={disabled}
                        autoComplete="off"
                        placeholder={formatMessage({ id: 'kernel.form.build_machine.placeholder' })}
                    />
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

export default BuildKernelForm