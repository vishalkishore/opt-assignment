import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "tailwindcss/tailwind.css";

import rawData from "../../../public/cdc.json";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Company = {
  Organisation: {
    Name: string;
    category: string;
  };
  JobOffer: {
    tentative_no_of_hires: number;
  }[];
};

const getCategoryJobOffers = (data: Company[]) => {
  const categoryOffers: Record<string, number> = {};

  data.forEach((company) => {
    const category = company.Organisation.category;
    const totalOffers = company.JobOffer.reduce(
      (sum, offer) => sum + offer.tentative_no_of_hires,
      0
    );

    if (categoryOffers[category]) {
      categoryOffers[category] += totalOffers;
    } else {
      categoryOffers[category] = totalOffers;
    }
  });

  return categoryOffers;
};

const JobOffersChart: React.FC = () => {
  const categoryJobOffers = useMemo(() => getCategoryJobOffers(rawData), []);

  const data = {
    labels: Object.keys(categoryJobOffers),
    datasets: [
      {
        label: "Number of Job Offers",
        data: Object.values(categoryJobOffers),
        backgroundColor: "#3C50E0",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Category vs Number of Job Offers",
      },
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="relative w-full h-96"> {/* Ensure height is set */}
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default JobOffersChart;
