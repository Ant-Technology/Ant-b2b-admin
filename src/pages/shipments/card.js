import React, { useEffect, useState } from "react";
import { Button, Group, Badge, Popover, Loader, Text } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

const StatusDropdown = ({ onStatusChange }) => {
  const [data, setData] = useState();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);

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

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setOpened(false);
    if (onStatusChange) {
      onStatusChange(value);
    }
  };

  return (
    <Group spacing="sm" position="left" style={{ paddingBottom: 20 }}>
      <Button
        color="orange"
        radius="md"
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
          {data?.pending > 0 ? data?.pending : 0}
        </Badge>
      </Button>
      <Button
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
          {data?.cancelled > 0 ? data?.cancelled : 0}
        </Badge>
      </Button>
      <Button
        color="blue"
        radius="md"
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
          {data?.delivered > 0 ? data?.delivered : 0}
        </Badge>
      </Button>
      <Button
        color="#00688B"
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#00688B",
            width: "120px",
            padding: "2px 5px",
          },
        }}>
             Shipped
        <Badge
          variant="filled"
          size="sm"
          style={{ backgroundColor: "#00688B", marginLeft: 6 }}
        >
         {data?.shipped > 0 ? data?.shipped : 0}
        </Badge>
        </Button>
    </Group>
  );
};

export default StatusDropdown;
