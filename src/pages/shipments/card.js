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

  const statuses = [
    { value: "PENDING", label: "Pending", color: "#FF6A00" },
    { value: "cancelled", label: "Cancelled", color: "green" },
    { value: "delivered", label: "Delivered", color: "blue" },
    { value: "shipped", label: "Shipped", color: "#00688B" },
  ];

  return (
    <Group spacing="sm" position="left">
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
            {selectedStatus
              ? statuses.find((status) => status.value === selectedStatus)
                  ?.label
              : "Shipment Status"}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          {loading ? (
            <Loader size="sm" />
          ) : (
            statuses.map((status) => (
              <div
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedStatus === status.value ? "#f0f0f0" : "transparent",
                }}
              >
                <Text
                  style={{
                    color: status.color,
                    flexGrow: 1,
                    textAlign: "left",
                  }}
                >
                  {status.label}
                </Text>
                <Badge
                  color={status.color}
                  variant="filled"
                  size="sm"
                  style={{ marginLeft: "6px" }}
                >
                  {data?.[status.value] > 0 ? data?.[status.value] : 0}
                </Badge>
              </div>
            ))
          )}
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
};

export default StatusDropdown;
