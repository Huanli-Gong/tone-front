import React , { useEffect, useState } from 'react'

import { CaretDownFilled , CaretRightFilled } from '@ant-design/icons'
import { ReactComponent as IconLink } from '@/assets/svg/icon_link.svg'
import { Table, Card , Typography, message } from 'antd'
import { evnPrepareState , tooltipTd } from '../components/index'
import Clipboard from 'clipboard'
import { queryBuildList } from '../service'
import { useRequest } from 'umi'
//import styles from './index.less'
import styled from 'styled-components';
const { Paragraph } = Typography;

const BuildDetail = `
    color: #1890FF;
    width: 90%;
    padding-left: 24px;
    float: left;

`
const BuildCopy = `
    width: 3%;
    cursor: pointer;
    float: left;

`
   
const BuildTable = styled(Table)`
    .expanded-row-padding-no>td {
        padding : 0 !important;
    }
    .buildWrap {
        height: 122px;
        padding: 20px 70px;
    }
    .buildChild {
        height: 27px;
        line-height: 27px;
        .buildName{
            width: 6%;
            float: left;
            font-weight: 600;
            color:rgba(0,0,0,0.85);
            text-align: right;
        }
        .kernel_copy {
            ${BuildDetail}
        }
        .copy_link_kernel {
            ${BuildCopy}
        }
        .devel_copy {
            ${BuildDetail}
        }
        .copy_link_devel {
            ${BuildCopy}
        }
        .headers_copy {
            ${BuildDetail}
        }
        .copy_link_headers{
            ${BuildCopy}
        }
        
    }
`
//Build内核 
export default ({ job_id , refresh = false } : any ) => {
    const [ dataSource, setDataSource ] = useState<Array<{}>>([])
    const { data , loading , run } = useRequest(
        () => queryBuildList({ job_id }),
        {
            formatResult : res => {
                if( res.code === 200){
                    let data:Array<{}> = []
                    data.push(res.data)
                    setDataSource(data)
                }else{
                    setDataSource([])

                }
            },
            manual : true
        }
    )
    useEffect(() => {
        run()
    },[ refresh ])
    useEffect(() => {
        const clipboardKernel = new Clipboard('.copy_link_kernel')
        const clipboardDevel = new Clipboard('.copy_link_devel' )
        const clipboardHeaders = new Clipboard('.copy_link_headers' ) 
        clipboardKernel.on('success', function(e) {
            message.success('复制成功')
            e.clearSelection();
        })
        clipboardDevel.on('success', function(e) {
            message.success('复制成功')
            e.clearSelection();
        })
        clipboardHeaders.on('success', function(e) {
            message.success('复制成功')
            e.clearSelection();
        })
        return () => {
            clipboardKernel.destroy()
            clipboardDevel.destroy()
            clipboardHeaders.destroy()
        }
    },[])

    const columns = [
        {
            dataIndex : 'name',
            title : '名称',
            ...tooltipTd(),
        },
        {
            dataIndex : 'state',
            title : '状态',
            render : evnPrepareState
        },
        {
            dataIndex : 'git_repo',
            title : '仓库',
            ellipsis:true,
            render:(_:string) => (
                _ ? 
                    <a href={_} target="_blank">{_}</a>
                : '-'
            )
        },
        {
            dataIndex : 'git_branch',
            title : '分支',
            ...tooltipTd(),
        },
        {
            dataIndex : 'git_commit',
            title : 'commit',
            ...tooltipTd(),
        },
        {
            dataIndex : 'cbp_link',
            title : 'cbp链接',
            ellipsis:true,
            render:(_:string) => (
                _ ? 
                    <a href={_} target="_blank">{_}</a>
                : '-'
            )
        },
        {
            dataIndex : 'start_timne',
            title : '开始时间',
            ...tooltipTd(),
        },
        {
            dataIndex : 'end_time',
            title : '结束时间',
            ...tooltipTd(),
        },
    ]

    return (
        dataSource && dataSource.length > 0 &&
        <Card 
            title="Build内核" 
            bodyStyle={{ paddingTop : 0 }}
            headStyle={{ borderBottom : 'none' , borderTop : 'none' }}
            style={{ marginBottom : 10 , borderTop : 'none' }}
        >
            <BuildTable 
                dataSource={ dataSource }
                columns={ columns }
                rowKey="name"
                loading={ loading }
                size="small"
                //className={ styles.buildTable }
                pagination={ false }
                expandable={{
                    expandedRowClassName: () => 'expanded-row-padding-no',
                    expandedRowRender : ( record : any ) => <div className="buildWrap">
                        <div className="buildChild">
                            <div className="buildName">kernel包</div>
                            <Paragraph className="kernel_copy" ellipsis={true}>
                                <a href={record.kernel_package} target="_blank">{record.kernel_package}</a>
                            </Paragraph>
                            <div data-clipboard-target=".kernel_copy" className="copy_link_kernel" ><IconLink /></div>
                        </div>
                        <div className="buildChild">
                            <div className="buildName">devel包</div> 
                            <Paragraph className="devel_copy" ellipsis={true}>
                                <a href={record.devel_package} target="_blank">{record.devel_package}</a>
                            </Paragraph>
                            <div data-clipboard-target=".devel_copy" className="copy_link_devel"><IconLink /></div>
                        </div>
                        <div className="buildChild">
                            <div className="buildName">headers包</div>
                            <Paragraph className="headers_copy" ellipsis={true}>
                                <a href={record.headers_package} target="_blank">{record.headers_package}</a>
                            </Paragraph>
                            <div data-clipboard-target=".headers_copy" className="copy_link_headers"><IconLink /></div>
                        </div>
                    </div>,
                    expandIcon: ({ expanded, onExpand, record }:any) => (
                        expanded ? 
                            (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                            (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                    )
                }}
            />
        </Card>
    )
}