import React, { useState } from "react";
import { Select, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@apollo/client";
import {
  GET_PRODUCTS,
  GET_RETAILERS,
  NON_PAGINATED_DRIVERS,
} from "apollo/queries"; // Ensure this is the correct query
import { useForm } from "@mantine/form";

export default function DriverFilter({ onCardClick, driver, fetchData, size }) {
  const [dropDownData, setDropDownData] = useState([]);
  const form = useForm({
    initialValues: {
      driver: null,
    },
  });

  const { loading: driverLoading } = useQuery(NON_PAGINATED_DRIVERS, {
    onCompleted(data) {
      const driverArr = data.driversNonPaginated.map((item) => ({
        label: item.name,
        value: item.name,
      }));
      setDropDownData(driverArr);
    },
  });

  const handleDriverSelect = (value) => {
    onCardClick(value);
  };

  return (
    <>
      {driverLoading && <LoadingOverlay visible={driverLoading} />}
      <Select
        placeholder="Filter By Driver"
        data={dropDownData}
        value={driver}
        label="Select Driver"
        onChange={(value) => {
          handleDriverSelect(value);
          if (value === null) {
            fetchData(size);
          }
        }}
        clearable
        searchable
        withinPortal
      />
    </>
  );
}
