import React, { useState } from 'react';
import rawData from '../../../public/cdc.json';

type JobOffer = {
  Designation: string;
  tentative_no_of_hires: number;
  TentativeJoiningDate: string;
  TentativeJobLocation: string;
  JobDescription: string;
};

type SalaryBreakup = {
  Base: number;
  MonthlyFixedSalary: number;
  Variables: number;
  GrossSalary: number;
  CostToCompany: number;
};

type Organisation = {
  Name: string;
  Sector: string[];
  website: string;
  category: string;
  postal_address: string;
};

type ProgramWiseSalaryBreakup = {
  btech?: SalaryBreakup;
  mtech?: SalaryBreakup;
  msc?: SalaryBreakup;
  PhD?: SalaryBreakup;
  MBA?: SalaryBreakup;
};

type Company = {
  Organisation: Organisation;
  JobOffer: JobOffer[];
  ProgramWiseSalaryBreakup: ProgramWiseSalaryBreakup;
};

// Extract CTC values for a specific program
const getHighestCTC = (
  program: keyof ProgramWiseSalaryBreakup,
  data: Company[],
) => {
  return data
    .map((company) => ({
      name: company.Organisation.Name,
      CTC: company.ProgramWiseSalaryBreakup[program]?.CostToCompany || 0,
      website: company.Organisation.website,
      program,
    }))
    .filter((company) => company.CTC > 0)
    .sort((a, b) => b.CTC - a.CTC);
};

const HighestPackage: React.FC = () => {
  const [program, setProgram] =
    useState<keyof ProgramWiseSalaryBreakup>('btech');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProgram(e.target.value as keyof ProgramWiseSalaryBreakup);
  };

  const highestCTC = getHighestCTC(program, rawData);

  return (
    <div>
      <h2>Highest CTC by Program</h2>
      <label>Select Program: </label>
      <select onChange={handleChange} value={program}>
        <option value="btech">BTech</option>
        <option value="mtech">MTech</option>
        <option value="msc">MSc</option>
        <option value="PhD">PhD</option>
        <option value="MBA">MBA</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>CTC</th>
            <th>Website</th>
          </tr>
        </thead>
        <tbody>
          {highestCTC.map((company, index) => (
            <tr key={index}>
              <td>{company.name}</td>
              <td>{company.CTC}</td>
              <td>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {company.website}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HighestPackage;
