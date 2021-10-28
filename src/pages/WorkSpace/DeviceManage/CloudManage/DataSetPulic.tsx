import React from "react";

interface DataSet {
    name?: string
}

const DataSetPulic: React.FC<DataSet> = (props) => {
    const { name } = props
    if (name == 'cloud') {
        return <div>普通云盘</div>
    } else if (name == 'cloud_efficiency') {
        return <div>高效云盘</div>
    } else if (name == 'cloud_ssd') {
        return <div>SSD云盘</div>
    } else if (name == 'cloud_essd') {
        return <div>ESSD云盘</div>
    } else {
        return <div>-</div>;
    }
}
export const dataSetMethod = (dict:any) => {
    const obj = {
        cloud:'普通云盘',
        cloud_efficiency:'高效云盘',
        cloud_ssd:'SSD云盘',
        cloud_essd:'ESSD云盘',
    }
    return obj[dict]
}

export default DataSetPulic;