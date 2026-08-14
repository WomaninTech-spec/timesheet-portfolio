function escapeCsv(value) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/** Renders the per-person summary as a CSV string. */
export function summaryToCsv(summary) {
  const header = 'Person,Maturation (days),Build (days),Total (days)';
  const rows = Object.entries(summary).map(
    ([person, { maturationDays, buildDays, totalDays }]) =>
      [escapeCsv(person), maturationDays, buildDays, totalDays].join(',')
  );
  return [header, ...rows].join('\n');
}

/** Renders the pivot (space x person x month) as a flat CSV string. */
export function pivotToCsv(pivot) {
  const header = 'Space,Person,Month,Maturation (days),Build (days),Total (days)';
  const rows = [];
  for (const [space, people] of Object.entries(pivot)) {
    for (const [person, months] of Object.entries(people)) {
      for (const [month, { maturationDays, buildDays, totalDays }] of Object.entries(months)) {
        rows.push(
          [escapeCsv(space), escapeCsv(person), month, maturationDays, buildDays, totalDays].join(',')
        );
      }
    }
  }
  return [header, ...rows].join('\n');
}
