import React from 'react';

export default function () {
    const [historyList, setHistoryList] = React.useState<any>([])
    return { historyList, setHistoryList };
}