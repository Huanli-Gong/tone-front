import React from "react";

interface DataSet {
    name?: string
    formatMessage?: any
}

const DataSetPulic: React.FC<DataSet> = (props) => {
    const { name, formatMessage } = props
    if (name == 'cloud') {
        return <div>{formatMessage({id: 'device.cloud'})}</div>
    } else if (name == 'cloud_efficiency') {
        return <div>{formatMessage({id: 'device.cloud_efficiency'})}</div>
    } else if (name == 'cloud_ssd') {
        return <div>{formatMessage({id: 'device.cloud_ssd'})}</div>
    } else if (name == 'cloud_essd') {
        return <div>{formatMessage({id: 'device.cloud_essd'})}</div>
    } else {
        return <div>-</div>;
    }
}
export const dataSetMethod = (dict:any, formatMessage: any) => {
    const obj = {
        cloud: formatMessage({id: 'device.cloud'}),
        cloud_efficiency: formatMessage({id: 'device.cloud_efficiency'}),
        cloud_ssd: formatMessage({id: 'device.cloud_ssd'}),
        cloud_essd: formatMessage({id: 'device.cloud_essd'}),
    }
    return obj[dict]
}

export default DataSetPulic;