import React from "react";

export function ListTable({ data }: { data: { columns: string[]; rows: Record<string, any>[] } }) {

  if (!data) {
    return <p className="text-gray-500">No data available.</p>;
  }

  if (!data.columns || !Array.isArray(data.columns) || data.columns.length === 0) {
    return <p className="text-gray-500">No columns available.</p>;
  }

  if (!data.rows || !Array.isArray(data.rows) || data.rows.length === 0) {
    return <p className="text-gray-500">No rows available.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-3xs divide-y divide-gray-200 bg-white text-sm">
        <thead className="bg-gray-50">
          <tr>
            {data.columns.map((col, colIndex) => (
              <th
                key={`header-${colIndex}-${col}`}
                scope="col"
                className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.rows.map((row, i) => (
            <tr key={`row-${i}`} className="hover:bg-gray-50">
              {data.columns.map((col, colIndex) => (
                <td key={`cell-${i}-${colIndex}-${col}`} className="px-4 py-2 text-gray-800">
                  {String(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
