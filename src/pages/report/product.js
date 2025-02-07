import React, { useState } from "react";
import { Select, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "apollo/queries"; // Ensure this is the correct query
import { useForm } from "@mantine/form";

export default function ProductFilter({ onCardClick, product }) {
  const [dropDownData, setDropDownData] = useState([]);
  const form = useForm({
    initialValues: {
      product: null,
    },
  });

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 1000,
      page: 1,
    },
    onCompleted: (data) => {
      const productArr = data.products.data.map((item) => ({
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
        placeholder="Filter By Product"
        data={dropDownData}
        value={product}
        label="Select Product"
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
