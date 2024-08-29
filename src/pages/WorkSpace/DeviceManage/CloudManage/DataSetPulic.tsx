import React from "react";

interface DataSet {
    name?: string
    formatMessage?: any
}

const DataSetPulic: React.FC<DataSet> = (props) => {
    const { name, formatMessage } = props
    if (name == 'cloud') {
        return <div>{formatMessage({ id: 'device.cloud' })}</div>
    } else if (name == 'cloud_efficiency') {
        return <div>{formatMessage({ id: 'device.cloud_efficiency' })}</div>
    } else if (name == 'cloud_ssd') {
        return <div>{formatMessage({ id: 'device.cloud_ssd' })}</div>
    } else if (name == 'cloud_essd') {
        return <div>{formatMessage({ id: 'device.cloud_essd' })}</div>
    } else if (name == 'ephemeral_ssd') {
        return <div>{formatMessage({ id: 'device.cloud_essd' })}</div>
    } else if (name == 'cloud_auto') {
        return <div>{formatMessage({ id: 'device.cloud_auto' })}</div>
    } else if (name == 'cloud_essd_entry') {
        return <div>{formatMessage({ id: 'device.cloud_essd_entry' })}</div>
    } else if (name == 'ESSD_PL0') {
        return <div>{formatMessage({ id: 'device.ESSD_PL0' })}</div>
    } else if (name == 'ESSD_FlexPL') {
        return <div>{formatMessage({ id: 'device.ESSD_FlexPL' })}</div>
    } else if (name == 'LOCAL_BASIC') {
        return <div>{formatMessage({ id: 'device.LOCAL_BASIC' })}</div>
    } else if (name == 'LOCAL_SSD') {
        return <div>{formatMessage({ id: 'device.LOCAL_SSD' })}</div>
    } else if (name == 'CLOUD_BASIC') {
        return <div>{formatMessage({ id: 'device.CLOUD_BASIC' })}</div>
    } else if (name == 'CLOUD_SSD') {
        return <div>{formatMessage({ id: 'device.CLOUD_SSD' })}</div>
    } else if (name == 'CLOUD_PREMIUM') {
        return <div>{formatMessage({ id: 'device.CLOUD_PREMIUM' })}</div>
    } else if (name == 'CLOUD_BSSD') {
        return <div>{formatMessage({ id: 'device.CLOUD_BSSD' })}</div>
    } else if (name == 'CLOUD_HSSD') {
        return <div>{formatMessage({ id: 'device.CLOUD_HSSD' })}</div>
    } else if (name == 'CLOUD_TSSD') {
        return <div>{formatMessage({ id: 'device.CLOUD_TSSD' })}</div>
    } else if (name == 'LOCAL_NVME') {
        return <div>{formatMessage({ id: 'device.LOCAL_NVME' })}</div>
    } else if (name == 'LOCAL_PRO') {
        return <div>{formatMessage({ id: 'device.LOCAL_PRO' })}</div>
    } else {
        return <div>{name || '-'}</div>
    }
}
export const dataSetMethod = (dict: any, formatMessage: any) => {
    const obj: any = {
        cloud: formatMessage({ id: 'device.cloud' }),
        cloud_efficiency: formatMessage({ id: 'device.cloud_efficiency' }),
        cloud_ssd: formatMessage({ id: 'device.cloud_ssd' }),
        cloud_essd: formatMessage({ id: 'device.cloud_essd' }),
        ephemeral_ssd: formatMessage({ id: 'device.ephemeral_ssd' }),
        cloud_auto: formatMessage({ id: 'device.cloud_auto' }),
        cloud_essd_entry: formatMessage({ id: 'device.cloud_essd_entry' }),
        ESSD_PL0: formatMessage({ id: 'device.ESSD_PL0' }),
        ESSD_FlexPL: formatMessage({ id: 'device.ESSD_FlexPL' }),
        LOCAL_BASIC: formatMessage({ id: 'device.LOCAL_BASIC' }),
        LOCAL_SSD: formatMessage({ id: 'device.LOCAL_SSD' }),
        CLOUD_BASIC: formatMessage({ id: 'device.CLOUD_BASIC' }),
        CLOUD_SSD: formatMessage({ id: 'device.CLOUD_SSD' }),
        CLOUD_PREMIUM: formatMessage({ id: 'device.CLOUD_PREMIUM' }),
        CLOUD_BSSD: formatMessage({ id: 'device.CLOUD_BSSD' }),
        CLOUD_HSSD: formatMessage({ id: 'device.CLOUD_HSSD' }),
        CLOUD_TSSD: formatMessage({ id: 'device.CLOUD_TSSD' }),
        LOCAL_NVME: formatMessage({ id: 'device.LOCAL_NVME' }),
        LOCAL_PRO: formatMessage({ id: 'device.LOCAL_PRO' })
    }
    return obj[dict]
}

export const displayRender = (label: any) => {
    if (label[label.length - 1] !== 'latest') {
        return label[label.length - 1];
    }
    return `${label[1].props?.children}:${label[2].props?.children}:latest`
}

export default DataSetPulic;