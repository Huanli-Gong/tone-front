import React , { memo, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select } from 'antd'
import ScriptsListForm from './ScriptsFormList'
import styles from './index.less'
import { itemLayout } from './untils'
import { useRequest } from 'umi'
import { queryRepositoryList } from '@/pages/WorkSpace/Product/services'

export default memo (
    ({ disabled = false , ws_id , needScriptList = true , form } : any ) => {
        const [ codeBranch , setCodeBranch ] = useState<any>( form?.getFieldValue('code_repo') )
        const { data } = useRequest(() => queryRepositoryList({ ws_id }) , { initialData : [] })

        const disabledStyles = disabled ? { backgroundColor: '#f5f5f5'} : {}

        const branches = useMemo(() => {
            for( let branch of data ) {
                if ( branch.git_url === codeBranch ) 
                    return branch.branches
            }
            return []
        } , [ codeBranch , data ])

        const hanldeChangeCodeRepo = ( val : any ) => {
            setCodeBranch( val )
            form.setFieldsValue({ code_branch : null })
        }

        return (
            <Form.Item label=" " >
                <Form.Item className={ styles.kernal_wrapper_styles }>
                    <Form.Item { ...itemLayout } label="代码仓库" name="code_repo" rules={[{ required : true , message : '请选择代码仓库' }]}>
                        <Select disabled={ disabled } placeholder="请选择" onChange={ hanldeChangeCodeRepo } >
                            {
                                data.map(( item : any ) => (
                                    <Select.Option key={ item.id } value={ item.git_url }>{ item.git_url }</Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item { ...itemLayout } label="代码分支" name="code_branch" rules={[{ required : true , message : '请选择代码分支' }]}>
                        <Select style={ disabledStyles } disabled={ disabled } placeholder="请选择代码分支">
                            {
                                branches.map(( item : any ) => (
                                    <Select.Option key={ item.id } value={ item.name }>{ item.name }</Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item { ...itemLayout } label="编译分支" name="compile_branch">
                        <Input style={ disabledStyles } readOnly={ disabled } autoComplete="off" placeholder="请输入编译工具的分支"/>
                    </Form.Item>
                    <Form.Item { ...itemLayout } label="CpuArch" name="cpu_arch" rules={[{ required : true , message : '请选择CpuArch'}]}>
                        <Select disabled={ disabled } placeholder="请选择">
                            <Select.Option value="x86_64">x86_64</Select.Option>
                            <Select.Option value="aarch64">aarch64</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item { ...itemLayout } label="Commit ID" name="commit_id">
                        <Input style={ disabledStyles } readOnly={ disabled } autoComplete="off" placeholder="请输入"/>
                    </Form.Item>
                    <Form.Item { ...itemLayout } label="Build config" name="build_config">
                        <Input style={ disabledStyles } readOnly={ disabled } autoComplete="off" placeholder="请输入编译工具的分支"/>
                    </Form.Item>
                    <Form.Item { ...itemLayout } label="Build machine" name="build_machine">
                        <Input style={ disabledStyles } readOnly={ disabled } autoComplete="off" placeholder="请输入编译工具的分支"/>
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