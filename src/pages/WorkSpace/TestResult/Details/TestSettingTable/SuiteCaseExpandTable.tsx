import React from 'react'
import { Table , Tooltip } from 'antd'
import PopoverEllipsis from '@/components/Public/PopoverEllipsis';

//测试用例及机器配置 expand table
export default ({ data = [], testType } : any ) => {
    let columns : any = [
        {
            title : 'Test Conf',
            dataIndex : 'test_case_name',
            ellipsis : true ,
            width : 200 , 
            render : ( _ : any ) => <Tooltip title={ _ }>{ _ }</Tooltip>
        },{
            title : '运行模式',
            dataIndex : 'run_mode',
        },{
            title : '机器',
            dataIndex : 'server_ip',
        },{
            title : 'Repeat',
            dataIndex : 'repeat',
        },{
            title : '变量',
            // dataIndex : 'env_info',
            render : ( _ : any ) => {
                return (
                    _.env_info && JSON.stringify( _.env_info ) !== '{}' ?
                        Object.keys( _.env_info ).reduce(
                            (  r , k , i ) => r += `${ i === 0 ? '' : ';' }${ k }=${ _.env_info[ k ] }`,
                            ''
                        ) : 
                        '-'
                )
            }
        },{
            title : '重启',
            dataIndex : 'need_reboot',
            render : ( _ : any ) => (
                _ ? '是' : '否'
            )
        },{
            title : '脚本',
            dataIndex : 'setup_info',
            ellipsis : true ,
            width : 150 , 
            render : ( _ : any, row: any ) => (
              <>
                {(_ || row.cleanup_info) ?
                  <Tooltip placement="topLeft" title={
                    <span>[重启前]: {_ || '-'},  [重启后]: {row.cleanup_info || '-'}</span>}
                  >
                    <span>[重启前]: {_ || '-'},  [重启后]: {row.cleanup_info || '-'}</span>
                  </Tooltip> : '-'
                }
              </>
            )
        },
    ];
    if(['business_business'].includes(testType)) {
        columns = columns.concat([{
            title: 'Console',
            dataIndex: 'console',
            width: 100,
            render: (text:any) => <PopoverEllipsis title={text} />,
        }])
    }
    columns = columns.concat([
        {
            title : '监控',
            render : ( _ : any ) => ( '-' )
            // dataIndex : 'monitor_info',
        },{
            title : '执行优先级',
            dataIndex : 'priority',
        }
    ]);

    return (
        <Table 
            dataSource={ data }
            columns={ columns }
            rowKey="test_case_id"
            pagination={ false }
            size="small"
        />
    )
}