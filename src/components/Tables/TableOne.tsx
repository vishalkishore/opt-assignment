import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  PaginationState,
  SortingState,
  flexRender,
} from '@tanstack/react-table';

import rawData from '../../../public/cdc.json';

type SalaryBreakup = {
  Base: number;
  MonthlyFixedSalary: number;
  Variables: number;
  GrossSalary: number;
  CostToCompany: number;
};

type ProgramWiseSalaryBreakup = {
  btech?: SalaryBreakup;
  mtech?: SalaryBreakup;
  msc?: SalaryBreakup;
  PhD?: SalaryBreakup;
  MBA?: SalaryBreakup;
};

type Company = {
  Organisation: {
    Name: string;
    website: string;
  };
  ProgramWiseSalaryBreakup: ProgramWiseSalaryBreakup;
};

// Helper function to get highest CTC, base salary, and gross salary
const getHighestSalaries = (
  program: keyof ProgramWiseSalaryBreakup,
  data: Company[],
) => {
  return data
    .map((company) => ({
      name: company.Organisation.Name,
      baseSalary: company.ProgramWiseSalaryBreakup[program]?.Base || 0,
      grossSalary: company.ProgramWiseSalaryBreakup[program]?.GrossSalary || 0,
      CTC: company.ProgramWiseSalaryBreakup[program]?.CostToCompany || 0,
      website: company.Organisation.website,
      program,
    }))
    .filter((company) => company.CTC > 0)
    .sort((a, b) => b.CTC - a.CTC);
};

const TableOne: React.FC = () => {
  const [program, setProgram] =
    useState<keyof ProgramWiseSalaryBreakup>('btech');
  const highestSalaries = useMemo(
    () => getHighestSalaries(program, rawData),
    [program],
  );

  // Define table columns, including Base Salary and Gross Salary
  const columns = useMemo<ColumnDef<(typeof highestSalaries)[0]>[]>(
    () => [
      {
        header: 'Company',
        accessorKey: 'name', // accessor is the "key" in the data
        cell: (info) => {
          const { name, website } = info.row.original;
          return (
            <a href={website} target="_blank" rel="noopener noreferrer">
              {name}
            </a>
          );
        },
      },
      {
        header: 'CTC',
        accessorKey: 'CTC',
        cell: (info) => info.getValue(),
      },
      {
        header: 'Base Salary',
        accessorKey: 'baseSalary',
        cell: (info) => info.getValue(),
      },
      {
        header: 'Gross Salary',
        accessorKey: 'grossSalary',
        cell: (info) => info.getValue(),
      },
    ],
    [],
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: highestSalaries,
    columns,
    state: {
      pagination: pagination,
      sorting: sorting,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
  });

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Top Companies by CTC ({program.toUpperCase()})
      </h4>

      {/* Dropdown to select program */}
      <label>Select Program: </label>
      <select
        onChange={(e) =>
          setProgram(e.target.value as keyof ProgramWiseSalaryBreakup)
        }
        value={program}
      >
        <option value="btech">BTech</option>
        <option value="mtech">MTech</option>
        <option value="msc">MSc</option>
        <option value="PhD">PhD</option>
        <option value="MBA">MBA</option>
      </select>

      {/* Table */}
      <table className="min-w-full leading-normal">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th
                  key={column.id}
                  className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  onClick={column.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    column.column.columnDef.header,
                    column.getContext(),
                  )}
                  {/* Add sorting indicator */}
                  <span>
                    {column.column.getIsSorted?.()
                      ? column.column.getIsSorted() === 'desc'
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-5 py-5 border-b border-gray-200 bg-white text-sm"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="pagination">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>{' '}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>{' '}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>{' '}
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>{' '}
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[5, 10].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TableOne;
