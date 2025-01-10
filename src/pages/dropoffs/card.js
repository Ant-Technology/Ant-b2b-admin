import React, { useEffect, useState } from "react";
import { Badge, Group, Popover, Button, Loader } from "@mantine/core";
import axios from "axios";
import { API } from "utiles/url";

export default function StatsGrid({ onCardClick }) {
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
      const { data } = await axios.get(`${API}/dropoff/status-counts`, config); // Correct API endpoint
      if (data) {
        setLoading(false);
        setData(data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setOpened(false);
    if (onCardClick) {
      onCardClick(value);
    }
    console.log("Selected Value:", value);
  };

  const options = [
    {
      value: "PENDING",
      label: "Pending",
      color: "#FF6A00",
    },
    {
      value: "DRIVER_ACCEPTED",
      label: "Accepted",
      color: "green",
    },
    {
      value: "FINISHED",
      label: "Finished",
      color: "blue",
    },
    {
      value: "STARTED",
      label: "Started",
      color: "#00688B",
    },
  ];
  return (
    <Group spacing="xs" position="left">
      <Popover
        opened={opened}
        onClose={() => setOpened(false)}
        position="bottom"
        withArrow
      >
        <Popover.Target>
          <Button
            onClick={() => setOpened((o) => !o)}
            style={{
              width: "160px",
              justifyContent: "space-between",
              display: "flex",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {status || "DropOff Status"}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          {loading ? (
            <Loader size="sm" />
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor:
                    status === option.value ? "#f0f0f0" : "transparent",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    color: option.color,
                    flexGrow: 1,
                    textAlign: "left",
                  }}
                >
                  {option.label}
                </span>
                <Badge
                  color={option.color}
                  variant="filled"
                  size="xs"
                  style={{
                    marginLeft: "25px",
                    textAlign: "right",
                  }}
                >
                  {data?.[option.value] > 0 ? data?.[option.value] : 0}
                </Badge>
              </div>
            ))
          )}
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
