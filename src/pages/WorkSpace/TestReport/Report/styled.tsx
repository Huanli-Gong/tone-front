import styled from 'styled-components'

export const Wrapper = styled.div`
    height: calc(100% - 20px);
    background:#fff;
`

export const Header = styled.div`
    height:auto;
    padding:0 20px;
    .title {
        font-size:32px;
        font-weight:bold;
        color:rgba(0,0,0,0.85);
        min-height: 40px;
        word-break: break-all;
        .btn{
            float:right;
            margin-right:20px;
        }
    }
    .describe{
        font-size:14px;
        font-weight:bold;
        color:rgba(0,0,0,0.85);
        margin:8px 0 ;
    }
    .report{
        font-size:14px;
        color:rgba(0,0,0,0.65);
        margin:8px 0 ;
    }
    .action{
        margin-bottom:20px;
        .edit{
            cursor:pointer;
        }
        .link{
            padding-left:18px;
            cursor:pointer;
        }
    }
    .empty{
        height:20px;
    }
`

export const Line = styled.div`
    height: 10px;
    background:#fafafa;
`
export const OverView = styled.div`
    height:auto;
    margin:20px;
    .title{
        font-size:16px;
        font-weight:bold;
        color:rgba(0,0,0,0.85); 
        margin-bottom: 16px;
        .line{
            width:2px;
            height:16px;
            background:#1890FF;
            margin: 4px 8px 4px -10px;
            float:left;
        }
    }
    .summary{
        .ant-table.ant-table-small .ant-table-tbody > tr > td{
            background: #fff;
            padding:0;
        }
        .right_border{
            border-right: 1px solid rgba(0,0,0,0.1);
        }
        .ant-table-tbody > tr > td{
            border-top: 1px solid #f0f0f0;
        }
        .summary_text{
            margin-bottom:8px;
        }
        .id_name{
            line-height: 72px;
            padding:0 16px;
            .top_test{
                height:27px;
                line-height:27px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                margin-bottom: 15px;
                padding-top: 6px;
            }
            .bottom_base{
                height:22px;
                line-height:22px;
                width: 88px;
                background: rgb(0, 137, 255);
                border-radius: 4px;
                padding-left: 8px;
                color: rgb(255, 255, 255);
                margin: 10px 8px 8px 0px;
            }
            .bottom_test{
                height:22px;
                line-height:22px;
                margin: 10px 8px 8px 0px;
            }
        }
        .per_test{
            height:40px;
            line-height: 40px;
            background:#fafafa;
            padding-left: 16px;
        }
        .empty{
            height:40px;
            line-height:40px;
            .all_case{
                font-size: 14px;
                color: #649FF6;
                padding-left: 16px;
            }
            .success_case{
                font-size: 14px;
                color: #81BF84;
                padding-left: 16px;
            }
            .fail_case{
                font-size: 14px;
                color: #C84C5A;
                padding-left: 16px;
            }
        }
        .table_margin{
            margin-bottom:20px;
            .ant-table-content{
                overflow:hidden !important;
            }
        }
    }
`
const ellipsis = `
    text-overflow:ellipsis;
    overflow:hidden;
    white-space:nowrap;
`
const enviroment_child = `
    .enviroment_child{
        width: 100%;
        height: 22px;
        line-height: 22px;
        display: inline-block;
        margin: 8px 0;
        ${ ellipsis }
    }
`
const enviroment_pulic = `
    padding: 0 21px;
    font-size: 14px;
`
export const TestEnv = styled.div`
    height: auto;
    .ant-table.ant-table-small .ant-table-tbody > tr > td{
        background: #fff;
        padding:0;
    }
    .ant-table-tbody > tr > td{
        border-top: 1px solid #f0f0f0;
    }
    .tootip_overflow {
        max-width: 540px;
        .ant-tooltip-inner {
            max-width: 540px;
            max-height: 360px;
            overflow-y: scroll;
        }
    }
    .title{
        font-size:16px;
        color:rgba(0,0,0,0.85);
        font-weight:bold;
        margin: 20px 0px;
        .line{
            width:2px;
            height:16px;
            background:#1890FF;
            margin: 4px 8px 4px 10px;
            float:left;
        }
    }
    .test_dev{
        margin:0 20px;
    }
    .table_margin{
        margin:20px;
        .right_border{
            border-right: 1px solid rgba(0,0,0,0.1);
            .id_name{
                line-height: 72px;
                padding:0 16px;
                .top_test{
                    height:27px;
                    line-height:27px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    margin-bottom: 15px;
                    padding-top: 6px;
                }
                .bottom_base{
                    height:22px;
                    line-height:22px;
                    width: 88px;
                    background: rgb(0, 137, 255);
                    border-radius: 4px;
                    padding-left: 8px;
                    color: rgb(255, 255, 255);
                    margin: 10px 8px 8px 0px;
                }
                .bottom_test{
                    height:22px;
                    line-height:22px;
                    margin: 10px 8px 8px 0px;
                }
            }
        }
        .ant-table-content{
            overflow:hidden !important;
        }
        .ip{
            color: rgba(0,0,0,0.85);
            height: 40px;
            line-height: 40px;
            font-weight: 500;
            background-color: #fafafa;
            ${enviroment_pulic}
        }
        .machine{
            color: rgba(0,0,0,0.85);
            height: 38px;
            line-height: 38px;
            font-weight: 500;
            ${enviroment_pulic}
        }
        .enviroment_ip{
            height: 40px;
            line-height: 40px;
            color: #1890FF;
            background-color: #fafafa;
            ${enviroment_pulic}
            ${enviroment_child}
        }
        .enviroment_machine{
            color: rgba(0,0,0,0.65);
            height: 38px;
            line-height: 38px;
            ${enviroment_pulic}
            ${enviroment_child}
        }
        .enviroment_rpm{
            height: 38px;
            line-height: 38px;
            color: #1890FF;
            ${enviroment_pulic}
            ${enviroment_child}
        }
        

    }
`
export const TestData = styled.div`
    .ant-table.ant-table-small .ant-table-thead > tr > th{
        padding:0;
    }
    .ant-table.ant-table-small .ant-table-tbody > tr > td{
        background: #fff;
        padding:0;
    }
    .ant-table-tbody > tr > td{
        border-top: 1px solid #f0f0f0;
    }
    height:auto;
    .table_margin{
        margin:20px;
        .right_border{
            border-right: 1px solid rgba(0,0,0,0.1);
            .id_name{
                line-height: 72px;
                padding:0 16px;
                .top_test{
                    height:27px;
                    line-height:27px;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    margin-bottom: 15px;
                    padding-top: 6px;
                }
                .bottom_base{
                    height:22px;
                    line-height:22px;
                    width: 88px;
                    background: rgb(0, 137, 255);
                    border-radius: 4px;
                    padding-left: 8px;
                    color: rgb(255, 255, 255);
                    margin: 10px 8px 8px 0px;
                }
                .bottom_test{
                    height:22px;
                    line-height:22px;
                    margin: 10px 8px 8px 0px;
                }
            }
        }
    }
    .title{
        font-size:16px;
        color:rgba(0,0,0,0.85);
        font-weight:bold;
        margin: 20px 0px;
        .line{
            width:2px;
            height:16px;
            background:#1890FF;
            margin: 4px 8px 4px 10px;
            float:left;
        }
    }

    .sub_title{
        font-size:14px;
        color:rgba(0,0,0,0.85);
        font-weight:bold;
        margin: 20px;
    }
    .suite_name{
        height: 40px;
        line-height: 40px;
        padding-left:21px;
        .remove_active {
            visibility : hidden;
        }
        :hover {
            .remove_active {
                visibility : visible;
                color: red;
                cursor: pointer;
                margin-top: 4px;
            }
        }
    }
    .right_border{
        //min-height: 38px;
        border-right: 1px solid rgba(0,0,0,0.1);
        .prover_title{
            color: #000;
            font-size: 14px;
            font-weight:  bold;
        }
        .prover_content{
            color: rgba(0,0,0,0.85);
            padding-left: 10px;
            font-size: 14px;
        }
        .remove_active{
            color: red;
            cursor: pointer;
            margin-top: 4px;
        }
        .conf_name{
            padding: 20px 0 8px 0;
             .conf_name_text{
                 color: rgba(0,0,0,0.85);
                 font-size: 14px;
                 height: 22px;
                 line-height: 22px;
                 display: block;
                 padding: 0 21px;
                 font-weight: 500;   
                 ${ ellipsis }
             }
             .anticon-minus-circle {
                visibility : hidden;
            }
            :hover {
                .anticon-minus-circle {
                    visibility : visible;
                    color: red;
                    cursor: pointer;
                    margin-top: 4px;
                }
            }
        }
        .metric_warp{
            height: 22px;
            line-height: 22px;
            .metric_name{
                 max-width: 240px;
                 display: inline-block;
                 color: rgba(0,0,0,0.65);
                 font-size: 14px;
                 padding-left: 40px;
                 ${ ellipsis }
            }
            .job_base_cv{
                color: rgba(0,0,0,0.65);
                font-size: 14px;
                padding: 0 0 0 16px;
                max-width: 220px;
                display: block;
                ${ ellipsis }
            }
            .job_cv{
                 color: rgba(0,0,0,0.65);
                 font-size: 14px;
                 padding: 0 0 0 16px;
                 max-width: 146px;
                 display: block;
                 float: left;
                 ${ ellipsis }
            }
            .job_common{
                 max-width: 85px;
                 float: right;
                 margin-right: 16px;
                 ${ ellipsis }
            }
            .cv_name{
                 color: rgba(0,0,0,0.65);
                 font-size: 14px;
                 float: right;
                 margin-right: 20px;
            }
            .normal{
                 color: rgba(0,0,0,1);
                 font-size: 14px;
                 padding-left: 7px;
            }
            .invalid{
                 color: rgba(0,0,0,0.25);
                 font-size: 14px;
                 padding-left: 7px;
            }
            .increase{
                 font-size: 14px;
                 padding-left: 7px;
                 color: #81BF84;
             }
             .decline{
                 font-size: 14px;
                 padding-left: 7px;
                 color: #C84C5A;
             }
        }
        .function_name{
            padding: 20px;
            height:62px;
            .remove_active {
                visibility : hidden;
            }
            :hover {
                .remove_active {
                    visibility : visible;
                    color: red;
                    cursor: pointer;
                    margin-top: 4px;
                }
            }
            .conf_name_text{
                color: rgba(0,0,0,0.85);
                font-size: 14px;
                height: 22px;
                line-height: 22px;
                font-weight: 500;   
                ${ ellipsis }
            }
            .all_case{
                font-size: 14px;
                color: #649FF6;
            }
            .success_case{
                font-size: 14px;
                color: #81BF84;
                padding-left: 21px;
            }
            .fail_case{
                font-size: 14px;
                color: #C84C5A;
                padding-left: 21px;
            }
        }
        .function_warp{
            height: 22px;
            line-height: 22px;
            margin-bottom: 8px;
            padding: 0 21px;
            .sub_case_name{
                width: 100%;
                display: inline-block;
                color: rgba(0,0,0,0.65);
                font-size: 14px;
                padding-left: 20px;
                ${ ellipsis }
            }
            .sub_case_red{
                font-size: 14px;
                color: #C84C5A;
            }
            .sub_case_green{
                font-size: 14px;
                color: #81BF84;
            }
            .sub_case_normal{
                font-size: 14px;
                color: rgba(0,0,0,0.85);
            }
            
        }
    }
    .func_table_row_no_padding{
        td {
            position: relative;
            padding: 0!important;
        }
    }
    .test_group{
        height:40px;
        line-height:40px;
        background:rgba(24,144,255,0.10);
        margin: 0 20px;
        .anticon-minus-circle {
            visibility : hidden;
        }
        :hover {
            .anticon-minus-circle {
                visibility : visible;
                color: red;
                cursor: pointer;
                margin-top: 4px;
            }
        }
        .line{
            width:4px;
            background:rgba(24,144,255,1);
            height: 40px;
            margin-right: 15px;
            float: left;
        }
        
    }
    .test_item{
        margin: 20px;
        .anticon-minus-circle {
            visibility : hidden;
        }
        :hover {
            .anticon-minus-circle {
                visibility : visible;
                color: red;
                cursor: pointer;
                margin-top: 4px;
            }
        }
        .item_style{
            line-height:32px;
        }
        .point{
            height:4px;
            width:4px;
            border-radius:50%;
            float: left;
            background: #FA6400;
            margin: 14px 7px 0 0;
        }
        .text{
            font-size:14px;
            font-weight:bold;
            color: #FA6400;
        }
    }
    .table_margin{
        margin:20px;
        .ant-table-content{
            overflow:hidden !important;
        }
    }
`