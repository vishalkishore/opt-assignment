import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import raw_data from '../../../public/cdc.json';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// TypeScript Interfaces for Organisation and

type Company = {
  Organisation: {
    Name: string;
    category: string;
    Sector: string[]; // Add Sector to Organisation
  };
  JobOffer: {
    tentative_no_of_hires: number;
  }[];
};

const processSectorData = (companies: Company[]) => {
  const sectorOfferMap: {
    [key: string]: { totalOffers: number; count: number };
  } = {};

  companies.forEach((company) => {
    const totalHiresInCompany = company.JobOffer.reduce(
      (sum, offer) => sum + offer.tentative_no_of_hires,
      0,
    );

    company.Organisation.Sector.forEach((sector) => {
      if (sectorOfferMap[sector]) {
        sectorOfferMap[sector].totalOffers += totalHiresInCompany;
        sectorOfferMap[sector].count += 1;
      } else {
        sectorOfferMap[sector] = { totalOffers: totalHiresInCompany, count: 1 };
      }
    });
  });

  const sectorAverages = Object.keys(sectorOfferMap).map((sector) => ({
    sector,
    averageOffers:
      sectorOfferMap[sector].totalOffers / sectorOfferMap[sector].count,
  }));

  return sectorAverages;
};

interface Dataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

// Typing for the chart data
interface ChartDataType {
  labels: string[];
  datasets: Dataset[];
}

const SectorChart: React.FC = () => {
  // Define chartData with explicit type
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const sectorData = processSectorData(raw_data);
    console.log(sectorData);
    const labels = sectorData.map((item) => item.sector);
    const avgOffers = sectorData.map((item) => item.averageOffers);
    console.log(labels, avgOffers);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Average Number of Offers per Sector',
          data: avgOffers,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, []);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h2 className="text-xl font-bold text-center mb-4">
        Average Sector-wise Job Offers
      </h2>
      <div className="relative w-full h-96">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default SectorChart;
