import React, { useEffect, useState } from "react";
import { Badge, Group, Button } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

export default function StatsGrid({ onCardClick, handelSearch,clearFilter }) {
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
  const handelOnClick = (status) => {
    onCardClick(status);
    handelSearch(null);
  };
  return (
    <Group spacing="sm" position="left" style={{ paddingBottom: 0 }}>
      {/* Pending Button */}
      <Button
        color="orange"
        onClick={() => handelOnClick("PENDING")}
        radius="md"
        styles={{
          root: {
            backgroundColor: "#FF6A00",
            fontWeight: "bold",
            width: "120px", // Decreased width
            padding: "2px 5px", // Decreased padding
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
        color="#00688B"
        radius="md"
        onClick={() => handelOnClick("STARTED")}
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#00688B",
            width: "120px", // Decreased width
            padding: "2px 5px", // Decreased padding
          },
        }}
      >
        Started
        <Badge
          variant="filled"
          size="sm"
          style={{ backgroundColor: "#00688B", marginLeft: 6 }}
        >
          {data?.STARTED > 0 ? data?.STARTED : 0}
        </Badge>
      </Button>
      <Button
        onClick={() => handelOnClick("FINISHED")}
        color="blue"
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            width: "120px", // Decreased width
            padding: "2px 5px", // Decreased padding
          },
        }}
      >
        Finished
        <Badge
          color="blue"
          variant="filled"
          size="sm"
          style={{ marginLeft: 6 }}
        >
          {data?.FINISHED > 0 ? data?.FINISHED : 0}
        </Badge>
      </Button>
      <Button
        color="green"
        onClick={() => handelOnClick("DRIVER_ACCEPTED")}
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            width: "120px",
            padding: "2px 5px",
          },
        }}
      >
        Accepted
        <Badge
          color="green"
          variant="filled"
          size="sm"
          style={{ marginLeft: 6 }}
        >
          {data?.DRIVER_ACCEPTED > 0 ? data?.DRIVER_ACCEPTED : 0}
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
}
