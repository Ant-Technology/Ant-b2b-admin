import React from "react";
import {
  Card,
  Text,
  Title,
  Group,
  Box,
  Avatar,
  Container,
} from "@mantine/core";
import { IconTruckDelivery, IconBuildingStore } from "@tabler/icons-react";

const UserStatus = () => {
  const data = [
    {
      title: "Admin",
      value: 253,
      icon: <IconTruckDelivery size={24} color="white" />,
      color: "orange",
    },
    {
      title: "Driver",
      value: 253,
      icon: <IconTruckDelivery size={24} color="white" />,
      color: "orange",
    },
    {
      title: "Retailers",
      value: 3968,
      icon: <IconBuildingStore size={24} color="white" />,
      color: "blue",
    },
  ];

  return (
    <Container>
      <Card shadow="sm" radius="md" padding="lg" style={{ marginTop: "20px" }}>
        {/* Title */}
        <Title order={4} mb="xs">
          User Status
        </Title>
        <Group
          spacing="md"
          position="apart"
          noWrap // Ensures all items are in one row
          style={{
            overflowX: "auto", // Enables horizontal scrolling if needed
            whiteSpace: "nowrap", // Prevents line breaks
          }}
        >
          {data.map((item, index) => (
            <Box
              key={index}
              style={{
                display: "inline-flex", // Keeps boxes inline
                alignItems: "center",
                backgroundColor: "#f8f9fa",
                padding: "10px 15px",
                borderRadius: "8px",
                flex: "0 0 auto", // Prevents shrinking
                maxWidth: "150px",
              }}
            >
              {/* Colored Icon */}
              <Avatar
                radius="md"
                size="md"
                color={item.color}
                style={{ marginRight: "12px" }}
              >
                {item.icon}
              </Avatar>

              {/* User Info */}
              <div>
                <Text size="xs" color="dimmed">
                  {item.title}
                </Text>
                <Text size="lg" weight={700}>
                  {item.value.toLocaleString()}
                </Text>
              </div>
            </Box>
          ))}
        </Group>
      </Card>
    </Container>
  );
};

export default UserStatus;
