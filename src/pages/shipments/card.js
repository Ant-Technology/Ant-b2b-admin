import React, { useEffect, useState } from "react";
import { Button, Group, Badge } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

const StatusButtons = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeposit();
  }, []);

  const fetchDeposit = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API}/shipment/status-counts`, config);
      if (data) {
        setLoading(false);
        setData(data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };



  return (
    <Group spacing="sm" position="left" style={{ paddingBottom: 20 }}>
      {/* Pending Button */}
      <Button
        color="orange"
        radius="xl"
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#FF6A00",
            width: "160px",
            padding: "2px 10px",
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
        radius="xl"
        styles={{
          root: {
            fontWeight: "bold",
            width: "160px",
            padding: "2px 10px",
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
        radius="xl"
        styles={{
          root: {
            fontWeight: "bold",
            width: "160px",
            padding: "2px 10px",
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
        radius="xl"
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#00688B",
            width: "160px",
            padding: "2px 10px",
          },
        }}
      >
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

export default StatusButtons;
