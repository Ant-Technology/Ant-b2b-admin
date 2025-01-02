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

  return (
    <Group spacing="sm" position="left" style={{ paddingBottom: 0 }}>
      {/* Pending Button */}
      <Button
        color="orange"
        radius="xl"
        styles={{
          root: {
            backgroundColor: "#FF6A00",
            fontWeight: "bold",
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
          {data?.PENDING > 0 ? data?.PENDING : 0}
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
        Started
        <Badge
          variant="filled"
          size="sm"
          style={{ backgroundColor: "#00688B", marginLeft: 6 }}
        >
          {data?.STARTED > 0 ? data?.STARTED : 0}
        </Badge>
      </Button>
    </Group>
  );
};

export default StatusButtons;
