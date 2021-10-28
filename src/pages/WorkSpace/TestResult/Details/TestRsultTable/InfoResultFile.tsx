import React from 'react'
import { queryCaseResultFile } from '../service'
import { useRequest , request } from 'umi'
import { Tree , Spin , Empty , message } from 'antd'

import styles from './index.less'

const TreeFileIcon : React.FC<any> = ( props : any ) => (
    <>
        {
            props.items.length > 0 ? 
                <span className={ styles.dir_icon  }/> : 
                <span className={ styles.file_icon }/>
        }
    </>
)

const treeDataMap = ( item : any , index : string | number = 0 ) : Array<any> => (
    item.map(( ctx : any , idx : number ) => (
        {
            ...ctx,
            title : ctx.name,
            key : `${ index }-${ idx }`,
            icon : ( p : any ) => <TreeFileIcon { ...p }/>,
            children : ctx.items && ctx.items.length > 0 ? treeDataMap( ctx.items , `${ index }-${ idx }` ) : [],
        }
    ))
)

export default ({ job_id , test_case_id , suite_id } : any ) => {
    const { data , loading } : any = useRequest(
        () => queryCaseResultFile({ job_id , case_id : test_case_id  , suite_id }),
        {
            initialData : [],
            formatResult : res => {
                if ( res.code === 200 ) {
                    return treeDataMap( res.data )
                }
                return []
            },
        }
    )

    const handleOpenOss = async ( path : string ) => {
        const data = await request(`/api/get/oss/url/` , { params : { path , job_id } })
        if ( data ) {
            if ( data.code === 200 && data.msg === 'ok' ) window.open( data.data )
            else message.warn('获取文件失败')
        }
    }

    const mapChildKey = ( arr : any , clickKey : any ) : any  => {
        if ( !arr.length ) return 
        for ( let x = 0 ; x < arr.length ; x ++ ) {
            let item = arr[ x ]
            if (( item.key === clickKey ) && item.path ) 
                return handleOpenOss( item.path )
            item.children.length > 0 && mapChildKey( item.children , clickKey )
        }
    }

    const handleSelectTree = ( _ : any ) => {
        const [ checkKey ] = _
        mapChildKey( data , checkKey )
    }

    return (
        <div style={{ minHeight : 50 }}>
            <Spin spinning={ loading }>
                {
                    data.length > 0 ?
                    <Tree
                        style={{ padding : 20 }}
                        treeData={ data }
                        showIcon={ true }
                        onSelect={ handleSelectTree }
                    />:
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> 
                }
            </Spin>
        </div>
    )
}