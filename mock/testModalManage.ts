import { Request , Response } from 'express'
import Mock from 'mockjs'

const { Random } = Mock

const getList = ( pageSize : any ) => {
    const tableListDataSource : Array<any> = []

    for ( let i = 0 ; i < pageSize ; i ++ ) {
        tableListDataSource.push({
            id : i ,
            name : Random.ctitle( 8 ),
            description : Random.csentence( 10 ),
            enable : Random.boolean(),
            job_type : '',
            creator_name : Random.cname(),
            update_user : Random.cname(),
            gmt_created : Random.date('yyyy-MM-dd h-mm-ss'),
            gmt_modified : Random.date('yyyy-MM-dd h-mm-ss'),
        })
    }

    return tableListDataSource
}

const queryModalList = ( req : Request , res : Response , u : string ) => {
    const { page_num = 1, page_size = 10 } = req.query;
    return res.json({
        data : getList( page_size ),
        total : page_num,
    })
}

export default {
    'GET /api/sys/test_modal/': queryModalList,
};
