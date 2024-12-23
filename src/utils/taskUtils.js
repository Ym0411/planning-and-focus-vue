export const getQuadrantType = (quadrant) => {
    switch (quadrant) {
        case 'URGENT_IMPORTANT':
            return 'danger'
        case 'IMPORTANT_NOT_URGENT':
            return 'warning'
        case 'URGENT_NOT_IMPORTANT':
            return 'info'
        case 'NOT_URGENT_NOT_IMPORTANT':
            return ''
        default:
            return 'warning'
    }
}

export const getQuadrantLabel = (quadrant) => {
    switch (quadrant) {
        case 'URGENT_IMPORTANT':
            return '重要紧急'
        case 'IMPORTANT_NOT_URGENT':
            return '重要不紧急'
        case 'URGENT_NOT_IMPORTANT':
            return '不重要紧急'
        case 'NOT_URGENT_NOT_IMPORTANT':
            return '不重要不紧急'
        default:
            return '未知'
    }
} 