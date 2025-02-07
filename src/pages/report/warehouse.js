import React, { useState } from "react";
import { Select, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@apollo/client";
import {GET_WARE_HOUSES } from "apollo/queries"; // Ensure this is the correct query
import { useForm } from "@mantine/form";

export default function WarehouseFilter({ onCardClick, retailer }) {
  const [dropDownData, setDropDownData] = useState([]);
  const form = useForm({
    initialValues: {
      retailer: null,
    },
  });

  const { data, loading } = useQuery(GET_WARE_HOUSES, {
    variables: {
      first: 1000,
      page: 1,
    },
    onCompleted: (data) => {
      const productArr = data.warehouses.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
      setDropDownData(productArr);
    },
  });

  const handleProductSelect = (value) => {
    onCardClick(value);
  };

  return (
    <>
      {loading && <LoadingOverlay visible={loading} />}
      <Select
        placeholder="Filter By Warehouse"
        data={dropDownData}
        value={retailer}
        label="Select Warehouse"
        onChange={(value) => {
          handleProductSelect(value);
        }}
        clearable
        searchable
        withinPortal
      />
    </>
  );
}
