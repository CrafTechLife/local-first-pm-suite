export function formatDateRange(start, end) {
    if (!start && !end) return '-';
    const formatDate = d => d ? new Date(d).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '';
    return `${formatDate(start)} - ${formatDate(end)}`;
}
