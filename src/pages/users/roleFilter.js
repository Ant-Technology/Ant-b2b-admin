import React, { useState, useEffect } from "react";
import { Select, LoadingOverlay } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";
import { useForm } from "@mantine/form";

export default function RoleFilter({ onCardClick, role }) {
  const [dropDownData, setDropDownData] = useState([]);
  const form = useForm({
    initialValues: {
      role: null,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/roles`, config);
      if (response.data) {
        const roleArr = response.data.roles.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setDropDownData(roleArr);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRoleSelect = (value) => {
    form.setFieldValue("role", value);
    if (onCardClick) {
      onCardClick(value);
    }
  };

  return (
    <Select
      placeholder="Filter By Role"
      data={dropDownData}
      value={form.values.role || role}
      onChange={(value) => {
        handleRoleSelect(value);
      }}
      onClear={() => handleRoleSelect(null)} // Handle clear action
      clearable
      searchable
      withinPortal
    />
  );
}