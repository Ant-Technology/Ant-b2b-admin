import { useQuery } from "@apollo/client";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Flex,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  Group,
} from "@mantine/core";
import { IconCaretDown } from "@tabler/icons";
import { GET_DROPOFF } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import React, { useEffect, useState } from "react";
import { CurrencyDollar, CreditCard, Receipt, Category } from "tabler-icons-react";
import { formatNumber } from "utiles/url";

const ManageDropOffModal = ({ editId, setOpenedEdit }) => {
  const [dropOffData, setDropOffData] = useState(null);
  const [collapse, setCollapse] = useState(null);
  const { loading } = useQuery(GET_DROPOFF, {
    variables: { id: editId },
    onCompleted(data) {
      setDropOffData(data);
    },
    onError(error) {
      console.error("Drop off data error:", error);
    },
  });

  return (
    <>
      <LoadingOverlay visible={loading} color="blue" overlayBlur={2} loader={customLoader} />
      <ScrollArea style={{ height: "90vh", marginY: 20 }}>
        <Card shadow="sm" p="lg" radius="md" withBorder>
          {dropOffData && dropOffData.dropoff.driver ? (
            <>
              <Button variant="light" color="blue" fullWidth mt="md" radius="md">
                Driver Information
              </Button>
              <Group position="apart" mt="md" mb="xs">
                <Text weight={500}>Name: {dropOffData.dropoff.driver.name}</Text>
                <Badge color="green" variant="light">City: {dropOffData.dropoff.driver.city}</Badge>
              </Group>
              <Text size="sm" color="dimmed">
                Phone: {dropOffData.dropoff.driver.phone}<br />
                Address: {dropOffData.dropoff.driver.address}
              </Text>
            </>
          ) : (
            <Button variant="light" color="blue" fullWidth mt="md" radius="md">
              Driver Not Assigned
            </Button>
          )}
        </Card>

        {dropOffData && dropOffData.dropoff.dropoff_order.map((data, idx) => (
          <Card key={idx} shadow="sm" p="lg" my="md" radius="md" withBorder>
            <Stack spacing="sm">
              <Group>
                <Group>
              <Text weight={500}>
                Payment Information
              </Text>
              </Group>
              </Group>
              <Group>
                <Group spacing="xs">
                  <CurrencyDollar size={20} color="#4dabf7" />
                  <Text size="sm" color="dimmed">Total Amount:</Text>
                </Group>
                <Text weight={500} size="md">{formatNumber(data.order.order_transaction.transaction.amount) || "N/A"}</Text>
              </Group>
              <Group>
                <Group spacing="xs">
                  <CreditCard size={20} color="#4dabf7" />
                  <Text size="sm" color="dimmed">Payment Method:</Text>
                </Group>
                <Text weight={500} size="md">{data.order.order_transaction.transaction.payment_method || "N/A"}</Text>
              </Group>
              <Group>
                <Group spacing="xs">
                  <Receipt size={20} color="#4dabf7" />
                  <Text size="sm" color="dimmed">Transaction Reference:</Text>
                </Group>
                <Text weight={500} size="md">{data.order.order_transaction.transaction.txn_ref || "N/A"}</Text>
              </Group>
              <Group>
                <Group spacing="xs">
                  <Category size={20} color="#4dabf7" />
                  <Text size="sm" color="dimmed">Transaction Type:</Text>
                </Group>
                <Text weight={500} size="md">{data.order.order_transaction.transaction.type || "N/A"}</Text>
              </Group>
            </Stack>
            <Group position="apart" mt="md" mb="xs">
              <Text weight={500}>
                Retailer: {data.order.retailer ? data.order.retailer.name : "unknown"}
              </Text>
              <Badge color={data.received ? "green" : "red"} variant="light">
                {data.received ? "Received" : "Not Received"}
              </Badge>
              <Badge color="yellow" variant="light">Items: {data.order.items.length}</Badge>
            </Group>
            <Text size="sm" color="dimmed">
              Phone: {data.order.retailer ? data.order.retailer.contact_phone : "unknown"}<br />
              Address: {data.order.retailer ? data.order.retailer.address : "unknown"}
            </Text>
            <Text size="sm" color="dimmed">
              City: {data.order.retailer ? data.order.retailer.city : "unknown"}
            </Text>
            <Button variant="light" color="yellow" fullWidth mt="md" radius="md">
              Order Price: {data.order.total_price}
            </Button>
            <Center mt="md">
              <Button onClick={() => setCollapse(idx)} fullWidth variant="outline">
                <IconCaretDown />
              </Button>
            </Center>
            {collapse === idx && (
              <ScrollArea style={{ width: "40vw", margin: "auto" }}>
                <Flex mih={150} gap="md" justify="center" align="center" direction="row">
                  {data.order.items.map((item, id) => (
                    <Card key={id} shadow="lg" p="lg" my="md" radius="md" style={{ width: "250px", height: "200px" }} withBorder>
                      <Avatar.Group>
                        {item.product_sku.product.images?.map((img, id) => (
                          <Avatar key={id} src={img.original_url} />
                        ))}
                      </Avatar.Group>
                      <Text>{item.product_sku.product.name}</Text>
                    </Card>
                  ))}
                </Flex>
              </ScrollArea>
            )}
          </Card>
        ))}
      </ScrollArea>
    </>
  );
};

export default ManageDropOffModal;