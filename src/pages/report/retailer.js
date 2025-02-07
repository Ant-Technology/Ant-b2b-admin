import React, { useState } from "react";
import { Select, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS, GET_RETAILERS } from "apollo/queries"; // Ensure this is the correct query
import { useForm } from "@mantine/form";

export default function RetailerFilter({ onCardClick, retailer }) {
  const [dropDownData, setDropDownData] = useState([]);
  const form = useForm({
    initialValues: {
      retailer: null,
    },
  });

  const { data, loading } = useQuery(GET_RETAILERS, {
    variables: {
      first: 1000,
      page: 1,
    },
    onCompleted: (data) => {
      const productArr = data.retailers.data.map((item) => ({
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
        placeholder="Filter By Retailer"
        data={dropDownData}
        value={retailer}
        label="Select Retailer"
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
