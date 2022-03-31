import { Row, Spin , Empty } from 'antd'
import React from 'react'
import { useParams, useRequest } from 'umi'
import { queryCaseResultVersionInfo } from '../service'
export default ({ test_case_id , suite_id } : any ) => {
    const { id: job_id } = useParams() as any
    const initialData : any = {
        kernel_version : '',
        rpm_info : [],
    }

    const { data , loading } = useRequest(
        () => queryCaseResultVersionInfo({ job_id , case_id : test_case_id , suite_id }),
        {
            initialData ,
            formatResult : res => {
                if ( res.code === 200 ) {
                    const [{ kernel_version  , rpm_info }] = res.data
                    if ( rpm_info && rpm_info !== '{}' ) 
                        return {
                            kernel_version , 
                            rpm_info : JSON.parse( rpm_info )
                        }
                    return { kernel_version , rpm_info : [] }
                }
                return initialData
            },
        }
    )
    
    console.log( data )
    return (
        <div style={{ background : '#fff' , padding : 20 }}>
            <Spin spinning={ loading } >
                <Row>
                    {
                        data.kernel_version && 
                        <>
                            <b style={{ marginRight : 16 }}>已安装内核&nbsp;</b><span>{ data.kernel_version }</span>
                        </>
                    }
                </Row>
                {
                    data.rpm_info.map(
                        ( item : any , index : number ) => (
                            <Row key={ index }>
                                <b style={{ marginRight : 16 }}>已安装RPM</b>
                                <span>{ item.rpm }</span>
                            </Row>
                        )
                    )
                }
                {
                    ( !data.kernel_version && data.rpm_info.length === 0 ) &&
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> 
                }
            </Spin>
        </div>
    )
}