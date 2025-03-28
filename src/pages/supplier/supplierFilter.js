import React, { useState, useEffect } from "react";
import { Select, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { GET_ALL_USERS } from "apollo/queries";
import { useQuery } from "@apollo/client";

export default function SupplierFilter({ onCardClick, supplier }) {
  const form = useForm({
    initialValues: {
      supplier: null,
    },
  });
  const [suppliers, setSuppliers] = useState([]);

  const { loading: supplierLoading } = useQuery(GET_ALL_USERS, {
    variables: {
      first: parseInt(100000),
      page: 1,
      search: "",
      role: "supplier",
    },

    onCompleted(data) {
      const arr = data.users.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));

      setSuppliers(arr);
    },
  });

  const handleSupplierSelect = (value) => {
    form.setFieldValue("supplier", value);
    if (onCardClick) {
      onCardClick(value);
    }
  };

  return (
    <Select
      placeholder="Filter By Supplier"
      data={suppliers}
      value={form.values.supplier || supplier}
      onChange={(value) => {
        handleSupplierSelect(value);
      }}
      onClear={() => handleSupplierSelect(null)}
      clearable
      searchable
      withinPortal
    />
  );
}
