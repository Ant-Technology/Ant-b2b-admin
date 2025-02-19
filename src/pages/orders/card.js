import React, { useEffect, useState } from "react";
import { Badge, Group, Button } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

export default function StatsGrid({
  onCardClick,
  handelSearch,
  clearFilter,
  selectedStatus,
}) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

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
      const { data } = await axios.get(`${API}/order/status-counts`, config);
      if (data) {
        setLoading(false);
        setData(data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handelOnClick = (status) => {
    onCardClick(status);
    handelSearch(null);
  };
  const getButtonStyles = (status) => ({
    root: {
      fontWeight: 600,
      backgroundColor: selectedStatus === status ? "#FF6A00" : "transparent",
      color: selectedStatus === status ? "white" : "rgb(20, 61, 89)",
      border: `1px solid ${selectedStatus === status ? "#FF6A00" : "#ddd"}`,
      width: "120px",
      padding: "8px 12px",
      transition: "all 0.2s ease",
      "&:hover": {
        color: "#FFFFFF",
        backgroundColor: "#FF6A00",
      },
    },
  });

  const getBadgeStyles = (status, color) => ({
    backgroundColor: selectedStatus === status ? 'white' : color,
    color: selectedStatus === status ? '#FF6A00' : 'white',
    marginLeft: 8,
  });


  return (
    <Group spacing="xs" position="left" style={{ paddingBottom: 16 }}>
      {/* Cancelled Button */}
      <Button
        onClick={() => handelOnClick("CANCELED")}
        radius="md"
        styles={getButtonStyles("CANCELED")}
      >
        Cancelled
        <Badge
          size="xs"
          style={getBadgeStyles("CANCELED",  "#FF6A00")}
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
          size="xs"
          style={getBadgeStyles("DELIVERED",  "#FF6A00")}
        >
          {data?.DELIVERED > 0 ? data?.DELIVERED : 0}
        </Badge>
      </Button>

      {/* Ordered Button */}
      <Button
        onClick={() => handelOnClick("ORDERED")}
        radius="md"
        styles={getButtonStyles("ORDERED")}
      >
        Ordered
        <Badge
          size="xs"
          style={getBadgeStyles("ORDERED",  "#FF6A00")}
        >
          {data?.ORDERED > 0 ? data?.ORDERED : 0}
        </Badge>
      </Button>

      {/* Back Ordered Button */}
      <Button
        onClick={() => handelOnClick("BACKORDERED")}
        radius="md"
        styles={getButtonStyles("BACKORDERED")}
      >
        Back Ordered
        <Badge
          size="xs"
          style={getBadgeStyles("BACKORDERED",  "#FF6A00")}
        >
          {data?.BACKORDERED > 0 ? data?.BACKORDERED : 0}
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
          size="xs"
          style={getBadgeStyles("SHIPPED",  "#FF6A00")}
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
}