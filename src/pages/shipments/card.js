import React, { useEffect, useState } from "react";
import { Button, Group, Badge, Popover, Loader, Text } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

const StatusDropdown = ({ onCardClick, handelSearch, clearFilter }) => {
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
    } finally {
      setLoading(false);
    }
  };

  const handelOnClick = (status) => {
    onCardClick(status);
    handelSearch(null);
  };

  return (
    <Group spacing="sm" position="left" style={{ paddingBottom: 20 }}>
      <Button
        color="orange"
        radius="md"
        onClick={() => handelOnClick("PENDING")}
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#FF6A00",
            width: "120px",
            padding: "2px 5px",
          },
        }}
      >
        Pending
        <Badge
          color="orange"
          variant="filled"
          size="sm"
          style={{ backgroundColor: "#FF6A00", marginLeft: 6 }}
        >
          {data?.PENDING > 0 ? data?.PENDING : 0}
        </Badge>
      </Button>
      <Button
        onClick={() => handelOnClick("CANCELED")}
        color="green"
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            width: "120px",
            padding: "2px 5px",
          },
        }}
      >
        Cancelled
        <Badge
          color="green"
          variant="filled"
          size="sm"
          style={{ marginLeft: 6 }}
        >
          {data?.CANCELED > 0 ? data?.CANCELED : 0}
        </Badge>
      </Button>
      <Button
        color="blue"
        radius="md"
        onClick={() => handelOnClick("DELIVERED")}
        styles={{
          root: {
            fontWeight: "bold",
            width: "120px",
            padding: "2px 5px",
          },
        }}
      >
        Delivered
        <Badge
          color="blue"
          variant="filled"
          size="sm"
          style={{ marginLeft: 6 }}
        >
          {data?.DELIVERED > 0 ? data?.DELIVERED : 0}
        </Badge>
      </Button>
      <Button
        color="#00688B"
        onClick={() => handelOnClick("SHIPPED")}
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#00688B",
            width: "120px",
            padding: "2px 5px",
          },
        }}
      >
        Shipped
        <Badge
          variant="filled"
          size="sm"
          style={{ backgroundColor: "#00688B", marginLeft: 6 }}
        >
          {data?.SHIPPED > 0 ? data?.SHIPPED : 0}
        </Badge>
      </Button>
      <Button
        color="gray"
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
