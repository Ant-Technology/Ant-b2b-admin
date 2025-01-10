import React, { useEffect, useState } from "react";
import { Button, Group, Badge, Select, LoadingOverlay } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";
import { useQuery } from "@apollo/client";
import { NON_PAGINATED_CATEGORIES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";

export default function CategoryFilter({ onCardClick }) {
  const [dropDownData, setDropDownData] = useState([]);

  const { loading: categoryLoading } = useQuery(NON_PAGINATED_CATEGORIES, {
    onCompleted(data) {
      const result = data.categoryNonPaginated.map((item) => ({
        label: item.name,
        value: item.id,
      }));

      setDropDownData(result);
    },
  });
  const handleCategorySelect = (value) => {
    if (onCardClick) {
      onCardClick(value); 
    }
  };
  
   return categoryLoading ? (
      <LoadingOverlay
        visible={categoryLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
    ) : (
    <Select
      placeholder="Filter By Category"
      data={dropDownData}
      clearable
      searchable
      style={{ width: 200 }}
      onChange={handleCategorySelect}
    />
  );
}
