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

// formatMonth("2026-11") → "พ.ย. 69"
export const formatMonth = (yearMonth: string) =>
    new Date(`${yearMonth}-01T00:00:00`).toLocaleDateString('th-TH', {
        year: '2-digit',
        month: 'short',
    });

// formatDay("2026-11-01") → "1 พ.ย."
export const formatDay = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString('th-TH', {
        month: 'short',
        day: 'numeric',
    });
