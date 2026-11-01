const baht = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
});

// formatBaht(1818.2) → "฿1,818.20"
export const formatBaht = (value: number) => baht.format(value);

export const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

export const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
