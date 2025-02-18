import React, { useEffect, useState } from "react";
import { Badge, Group, Button } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

export default function StatsGrid({ onCardClick, handelSearch, clearFilter,selectedStatus }) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
//  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    fetchDeposit();
  }, []);

  const fetchDeposit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API}/dropoff/status-counts`, config);
      if (data) {
        setLoading(false);
        setData(data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleStatusClick = (status) => {
    onCardClick(status);
    handelSearch(null);
  };

  const handleClearFilter = () => {
    clearFilter();
  };

  const getButtonStyles = (status) => ({
    root: {
      fontWeight: 600,
      backgroundColor: selectedStatus === status ? '#666666' : 'transparent',
      color: selectedStatus === status ? 'white' : '#666666',
      border: `1px solid ${selectedStatus === status ? '#666666' : '#ddd'}`,
      width: "120px",
      padding: "8px 12px",
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: selectedStatus === status ? '#666666' : '#f5f5f5',
      },
    },
  });

  const getBadgeStyles = (status, color) => ({
    backgroundColor: selectedStatus === status ? 'white' : color,
    color: selectedStatus === status ? '#666666' : 'white',
    marginLeft: 8,
  });

  return (
    <Group spacing="sm" position="left" style={{ paddingBottom: 0 }}>
      {/* Pending Button */}
      <Button
        onClick={() => handleStatusClick("PENDING")}
        radius="md"
        styles={getButtonStyles("PENDING")}
      >
        Pending
        <Badge
          size="sm"
          style={getBadgeStyles("PENDING", "#FF6A00")}
        >
          {data?.PENDING > 0 ? data?.PENDING : 0}
        </Badge>
      </Button>

      {/* Started Button */}
      <Button
        onClick={() => handleStatusClick("STARTED")}
        radius="md"
        styles={getButtonStyles("STARTED")}
      >
        Started
        <Badge
          size="sm"
          style={getBadgeStyles("STARTED", "#FF6A00")}
        >
          {data?.STARTED > 0 ? data?.STARTED : 0}
        </Badge>
      </Button>

      {/* Finished Button */}
      <Button
        onClick={() => handleStatusClick("FINISHED")}
        radius="md"
        styles={getButtonStyles("FINISHED")}
      >
        Finished
        <Badge
          size="sm"
          style={getBadgeStyles("FINISHED", "#FF6A00")}
        >
          {data?.FINISHED > 0 ? data?.FINISHED : 0}
        </Badge>
      </Button>

      {/* Accepted Button */}
      <Button
        onClick={() => handleStatusClick("DRIVER_ACCEPTED")}
        radius="md"
        styles={getButtonStyles("DRIVER_ACCEPTED")}
      >
        Accepted
        <Badge
          size="sm"
          style={getBadgeStyles("DRIVER_ACCEPTED", "#FF6A00")}
        >
          {data?.DRIVER_ACCEPTED > 0 ? data?.DRIVER_ACCEPTED : 0}
        </Badge>
      </Button>

      {/* All Button */}
      <Button
        onClick={handleClearFilter}
        radius="md"
        styles={{
          root: {
            fontWeight: 600,
            backgroundColor: selectedStatus === null ? '#666666' : '#808080',
            color: 'white',
            width: "80px",
            padding: "8px 12px",
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: selectedStatus === null ? '#666666' : '#909090',
            },
          },
        }}
      >
        All
      </Button>
    </Group>
  );
}