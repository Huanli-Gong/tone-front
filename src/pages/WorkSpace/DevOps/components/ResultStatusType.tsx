import { Radio } from 'antd'
import React from 'react'
import ConfigRow from './ConfigRow'
import { QusetionIconTootip } from '@/pages/WorkSpace/TestJob/components/untils'

const ResultTestType: React.FC<{ dataSource: any, update: any, field: string }> = (props) => {
    const { dataSource, update, field } = props
    const fieldValue = dataSource[field]
    const onChange: any = ({ target }: any) => update({ [field]: target.value })

    return (
        <ConfigRow title={'功能测试类型'} >
            <Radio.Group
                defaultValue={fieldValue}
                onChange={onChange}
                value={fieldValue}
            >
                <Radio value={'1'}>
                    type1
                </Radio>
                <Radio value={'2'}>
                    <QusetionIconTootip
                        title="type2"
                        desc={`type1: 按照执行结果为依据展示\ntype2: 按照case结果为依据展示`}
                    />
                </Radio>
            </Radio.Group>
        </ConfigRow>
    )
}

export default ResultTestType