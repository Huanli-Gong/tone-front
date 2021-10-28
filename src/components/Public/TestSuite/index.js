import React from 'react';

const suiteChange = (text, record) => {
    let name = record.view_type 
    let result = name.match(/\(([^)]*)\)/)
    if (result) {
        return result[1]; 
    } else {
        return record.view_type || '-'
    }
}
export { suiteChange }