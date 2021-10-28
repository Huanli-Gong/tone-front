import React from 'react';
import Performance from './Performance'
import Functional from './Functional'
const TestDataPage = (props: any) => {
    const { groupData, baseIndex, data, btn, template , identify, onSourceChange , source } = props
    return (
        <div>
            <div className="title" id="test_data"><span className="line"></span>测试数据</div>
            { template?.is_default ? 
                <>
                    { data.perf_data && JSON.stringify(data.perf_data) !== '{}' && <div className="sub_title">性能数据</div> }
                    <Performance
                        btn={btn}
                        identify={identify}
                        template={template}
                        perf_data={data.perf_data}
                        groupData={groupData}
                        source={ source }
                        baseIndex={baseIndex}
                        onSourceChange={onSourceChange}
                    />
                    { data.func_data && JSON.stringify(data.func_data) !== '{}' && <div className="sub_title">功能数据</div> }
                    <Functional
                        btn={btn}
                        func_data={data.func_data}
                        groupData={groupData}
                        source={ source }
                        baseIndex={baseIndex}
                        onSourceChange={onSourceChange}
                    />
                </>
                :
                <>
                    {
                        template?.need_perf_data &&
                        <>
                            <div className="sub_title">性能数据</div>
                            <Performance
                                btn={btn}
                                identify={identify}
                                template={template}
                                perf_data={data.perf_data}
                                groupData={groupData}
                                source={ source }
                                baseIndex={baseIndex}
                                onSourceChange={onSourceChange}
                            />
                        </>
                    }
                    {
                        template?.need_func_data &&
                        <>
                            <div className="sub_title">功能数据</div>
                            <Functional
                                btn={btn}
                                func_data={data.func_data}
                                groupData={groupData}
                                source={ source }
                                baseIndex={baseIndex}
                                onSourceChange={onSourceChange}
                            />
                        </>
                    }
                </>
            }
            
        </div>
    )
}

export default TestDataPage;