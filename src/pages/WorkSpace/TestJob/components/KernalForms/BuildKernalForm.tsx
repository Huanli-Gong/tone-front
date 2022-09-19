import React , { memo, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select } from 'antd'
import ScriptsListForm from './ScriptsFormList'
import styles from './index.less'
import { itemLayout } from './untils'
import { useRequest, useIntl, FormattedMessage } from 'umi'
import { queryRepositoryProject } from '@/pages/WorkSpace/Product/services'

export default memo (
    ({ disabled = false , ws_id , needScriptList = true , form, project_id } : any ) => {
        const { formatMessage } = useIntl()
        const [ codeBranch , setCodeBranch ] = useState<any>( form?.getFieldValue('code_repo') )
        const { data = [], run } = useRequest(() => 
        queryRepositoryProject({ project_id }) , { initialData : [], manual:true })
        const disabledStyles = disabled ? { backgroundColor: '#f5f5f5'} : {}

        const branches = useMemo(() => {
            for( let branch of data ) {
                if ( branch.repo_id === codeBranch ) 
                    return branch.branch_dict
            }
            return []
        } , [ codeBranch , data ])

        useEffect(()=>{
            run()
            form?.resetFields()
        },[ project_id ])

        const hanldeChangeCodeRepo = ( val : any ) => {
            setCodeBranch( val )
            form.setFieldsValue({ code_branch : null })
        }

        return (
            <Form.Item label=" " >
                <Form.Item className={ styles.kernal_wrapper_styles }>
                    <Form.Item { ...itemLayout } 
                        label={<FormattedMessage id="kernel.form.code_repo" />}
                        name="code_repo" 
                        rules={[{ 
                            required : true , 
                            message: formatMessage({id: 'kernel.form.code_repo.message'})
                        }]}>
                        <Select disabled={ disabled }
                            placeholder={formatMessage({id: 'kernel.form.code_repo.placeholder'}) }
                            onChange={ hanldeChangeCodeRepo } >
                            {
                                data.map(( item : any ) => (
                                    <Select.Option key={ item.repo_id } value={ item.repo_id }>{ item.repo_git_url }</Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item { ...itemLayout } 
                        label={<FormattedMessage id="kernel.form.code_branch" />}
                        name="code_branch" 
                        rules={[{ 
                            required : true , 
                            message: formatMessage({id: 'kernel.form.code_branch.message'})
                        }]}>
                        <Select style={ disabledStyles } 
                            disabled={ disabled } 
                            placeholder={formatMessage({id: 'kernel.form.code_branch.message'}) }
                        >
                            {
                                branches?.map(( item : any ) => (
                                    <Select.Option key={ item.id } value={ item.id }>{ item.name }</Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item { ...itemLayout } 
                        label={<FormattedMessage id="kernel.form.compile_branch" />}
                        name="compile_branch">
                        <Input style={ disabledStyles } readOnly={ disabled } autoComplete="off" 
                            placeholder={formatMessage({id: 'kernel.form.compile_branch.message'}) }
                        />
                    </Form.Item>
                    <Form.Item { ...itemLayout } 
                        label={<FormattedMessage id="kernel.form.cpu_arch" />}
                        name="cpu_arch" 
                        rules={[{ 
                            required : true , 
                            message: formatMessage({id: 'kernel.form.cpu_arch.message'})
                        }]}>
                        <Select 
                            disabled={ disabled } 
                            placeholder={formatMessage({id: 'kernel.form.cpu_arch.placeholder'}) }
                        >
                            <Select.Option value="x86_64">x86_64</Select.Option>
                            <Select.Option value="aarch64">aarch64</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item { ...itemLayout } 
                        label="Commit ID" 
                        name="commit_id">
                        <Input style={ disabledStyles } readOnly={ disabled } 
                            autoComplete="off" 
                            placeholder={formatMessage({id: 'kernel.form.commit_id.placeholder'}) }
                        />
                    </Form.Item>
                    <Form.Item { ...itemLayout } label="Build Config" name="build_config">
                        <Input style={ disabledStyles } readOnly={ disabled } 
                            autoComplete="off" 
                            placeholder={formatMessage({id: 'kernel.form.build_config.placeholder'}) }
                        />
                    </Form.Item>
                    <Form.Item { ...itemLayout } label="Build Server" name="build_machine">
                        <Input style={ disabledStyles } readOnly={ disabled } 
                            autoComplete="off" 
                            placeholder={formatMessage({id: 'kernel.form.build_machine.placeholder'}) }
                        />
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