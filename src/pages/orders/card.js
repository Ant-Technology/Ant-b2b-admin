import React, { useEffect, useState } from "react";
import { Button, Group, Badge } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

export default function StatsGrid({ onCardClick }) {
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

  return (
    <Group spacing="xs" position="left" style={{ paddingBottom: 16 }}>
      {/* Cancelled Button */}
      <Button
        onClick={() => onCardClick("CANCELED")}
        color="green"
        radius="xl"
        styles={{
          root: {
            fontWeight: "bold",
            width: "140px",
            padding: "2px 10px",
          },
          label: {
            fontSize: "14px",
          },
        }}
      >
        Cancelled
        <Badge
          color="green"
          variant="filled"
          size="xs"
          style={{ marginLeft: 4, fontSize: "12px" }}
        >
          {data?.CANCELED > 0 ? data?.CANCELED : 0}
        </Badge>
      </Button>

      {/* Delivered Button */}
      <Button
        onClick={() => onCardClick("DELIVERED")}
        color="blue"
        radius="xl"
        styles={{
          root: {
            fontWeight: "bold",
            width: "140px",
            padding: "2px 10px",
          },
          label: {
            fontSize: "14px",
          },
        }}
      >
        Delivered
        <Badge
          color="blue"
          variant="filled"
          size="xs"
          style={{ marginLeft: 4, fontSize: "12px" }}
        >
          {data?.DELIVERED > 0 ? data?.DELIVERED : 0}
        </Badge>
      </Button>

      {/* Ordered Button */}
      <Button
        onClick={() => onCardClick("ORDERED")}
        color="blue"
        radius="xl"
        styles={{
          root: {
            fontWeight: "bold",
            width: "140px",
            padding: "2px 10px",
          },
          label: {
            fontSize: "14px",
          },
        }}
      >
        Ordered
        <Badge
          color="blue"
          variant="filled"
          size="xs"
          style={{ marginLeft: 4, fontSize: "12px" }}
        >
          {data?.ORDERED > 0 ? data?.ORDERED : 0}
        </Badge>
      </Button>

      {/* Back Ordered Button */}
      <Button
        color="purple"
        radius="xl"
        styles={{
          root: {
            backgroundColor: "#225F4F",
            fontWeight: "bold",
            width: "140px",
            padding: "2px 10px",
          },
          label: {
            fontSize: "14px",
          },
        }}
      >
        Back Ordered
        <Badge
          color="purple"
          variant="filled"
          size="xs"
          style={{
            backgroundColor: "#225F4F",
            marginLeft: 4,
            fontSize: "12px",
          }}
        >
          {data?.BACKORDERED > 0 ? data?.BACKORDERED : 0}
        </Badge>
      </Button>

      {/* Shipped Button */}
      <Button
        onClick={() => onCardClick("SHIPPED")}
        radius="xl"
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#00688B",
            width: "140px",
            padding: "2px 10px",
          },
          label: {
            fontSize: "14px",
          },
        }}
      >
        Shipped
        <Badge
          variant="filled"
          size="xs"
          style={{
            backgroundColor: "#00688B",
            marginLeft: 4,
            fontSize: "12px",
          }}
        >
          {data?.SHIPPED > 0 ? data?.SHIPPED : 0}
        </Badge>
      </Button>
    </Group>
  );
}
