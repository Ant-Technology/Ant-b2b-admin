import React, { useState, useEffect } from "react";
import { Select, LoadingOverlay } from "@mantine/core";
import { useQuery } from "@apollo/client";
import { NON_PAGINATED_CATEGORIES } from "apollo/queries";
import { useForm } from "@mantine/form";

export default function CategoryFilter({ onCardClick,category }) {
  const [dropDownData, setDropDownData] = useState([]);
  const form = useForm({
    initialValues: {
      category: null, // Initialize with null
    },
  });

  const { loading: categoryLoading } = useQuery(NON_PAGINATED_CATEGORIES, {
    onCompleted(data) {
      const productArr = data.categoryNonPaginated.map((item) => ({
        label: item.name,
        value: String(item.id), // Ensure value is a string
      }));
      console.log("Fetched dropdown data:", productArr); // Debug fetched data
      setDropDownData(productArr);
    },
  });

  useEffect(() => {
    console.log("Updated form value:", form.values.category);
  }, [form.values.category]);

  const handleCategorySelect = (value) => {
    console.log("Selected value:", value);
    form.setFieldValue("category", value);
    form.setValues({ category: value }); // Ensure form state updates
    console.log("Setting category to:", value);

    if (onCardClick) {
      onCardClick(value);
    }
  };

  console.log("Current form value before render:", form.values.category);

  return (
    <Select
      placeholder="Filter By Category"
      data={dropDownData}
      value={form.values.category || category}
      onChange={(value) => {
        console.log("onChange triggered with:", value);
        handleCategorySelect(value);
      }}
      clearable
      searchable
      withinPortal
    />
  );
}
