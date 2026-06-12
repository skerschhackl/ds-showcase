import type { ReactNode } from "react";

export function Table({
  columns,
  rows,
  caption,
  ariaLabel
}: {
  columns: string[];
  rows: Array<Array<ReactNode>>;
  caption?: string;
  ariaLabel?: string;
}) {
  return (
    <div className="ds-table-wrap">
      <table className="ds-table" aria-label={caption ? undefined : ariaLabel}>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
