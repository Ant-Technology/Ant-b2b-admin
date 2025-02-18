import React, { useEffect, useState } from "react";
import { Button, Group, Badge } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

const StatusDropdown = ({
  onCardClick,
  handelSearch,
  clearFilter,
  selectedStatus,
}) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShipmentData();
  }, []);

  const fetchShipmentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/shipment/status-counts`, config);
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching shipment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handelOnClick = (status) => {
    onCardClick(status);
    handelSearch(null);
  };

  const getButtonStyles = (status) => ({
    root: {
      fontWeight: 600,
      backgroundColor: selectedStatus === status ? "#666666" : "transparent",
      color: selectedStatus === status ? "white" : "#666666",
      border: `1px solid ${selectedStatus === status ? "#666666" : "#ddd"}`,
      width: "120px",
      padding: "8px 12px",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: selectedStatus === status ? "#666666" : "#f5f5f5",
      },
    },
  });

  const getBadgeStyles = (status, color) => ({
    backgroundColor: selectedStatus === status ? "white" : color,
    color: selectedStatus === status ? "#666666" : "white",
    marginLeft: 6,
  });

  return (
    <Group spacing="sm" position="left" style={{ paddingBottom: 20 }}>
      {/* Pending Button */}
      <Button
        onClick={() => handelOnClick("PENDING")}
        radius="md"
        styles={getButtonStyles("PENDING")}
      >
        Pending
        <Badge
          color="orange"
          variant="filled"
          size="sm"
          style={getBadgeStyles("PENDING", "#FF6A00")}
        >
          {data?.PENDING > 0 ? data?.PENDING : 0}
        </Badge>
      </Button>

      {/* Cancelled Button */}
      <Button
        onClick={() => handelOnClick("CANCELED")}
        radius="md"
        styles={getButtonStyles("CANCELED")}
      >
        Cancelled
        <Badge
          color="green"
          variant="filled"
          size="sm"
          style={getBadgeStyles("CANCELED", "#FF6A00")}
        >
          {data?.CANCELED > 0 ? data?.CANCELED : 0}
        </Badge>
      </Button>

      {/* Delivered Button */}
      <Button
        onClick={() => handelOnClick("DELIVERED")}
        radius="md"
        styles={getButtonStyles("DELIVERED")}
      >
        Delivered
        <Badge
          color="blue"
          variant="filled"
          size="sm"
          style={getBadgeStyles("DELIVERED", "#FF6A00")}
        >
          {data?.DELIVERED > 0 ? data?.DELIVERED : 0}
        </Badge>
      </Button>

      {/* Shipped Button */}
      <Button
        onClick={() => handelOnClick("SHIPPED")}
        radius="md"
        styles={getButtonStyles("SHIPPED")}
      >
        Shipped
        <Badge
          variant="filled"
          size="sm"
          style={getBadgeStyles("SHIPPED", "#FF6A00")}
        >
          {data?.SHIPPED > 0 ? data?.SHIPPED : 0}
        </Badge>
      </Button>

      {/* All Button */}
      <Button
        onClick={clearFilter}
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#808080", // Neutral gray color
            width: "60px",
            padding: "2px 5px",
          },
        }}
      >
        All
      </Button>
    </Group>
  );
};

export default StatusDropdown;
