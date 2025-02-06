import React, { useEffect, useState } from "react";
import {
  Badge,
  Group,
  Popover,
  Button,
  Loader,
  LoadingOverlay,
} from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";
import { IconChevronDown } from "@tabler/icons-react";
import { customLoader } from "components/utilities/loader";

export default function StatsGrid({ onCardClick, handelSearch, clearFilter }) {
  const [data, setData] = useState();
  const [status, setStatus] = useState(null);
  const [opened, setOpened] = useState(false);
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
  return (
    <Group spacing="xs" position="left" style={{ paddingBottom: 16 }}>
      {/* Cancelled Button */}
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
      <Button
        onClick={() => handelOnClick("DELIVERED")}
        color="blue"
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            width: "120px",
            padding: "2px 5px",
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
      <Button
        onClick={() => handelOnClick("ORDERED")}
        color="blue"
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            width: "120px",
            padding: "2px 5px",
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
      <Button
        onClick={() => handelOnClick("BACKORDERED")}
        color="purple"
        radius="md"
        styles={{
          root: {
            backgroundColor: "#225F4F",
            fontWeight: "bold",
            width: "130px",
            padding: "2px 5px",
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
      <Button
        onClick={() => handelOnClick("SHIPPED")}
        radius="md"
        styles={{
          root: {
            fontWeight: "bold",
            backgroundColor: "#00688B",
            width: "120px",
            padding: "2px 5px",
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
