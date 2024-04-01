import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_SHIPMENTS } from "apollo/queries";
import {
  LoadingOverlay,
  Drawer,
  Group,
  Badge,
  useMantineTheme,
  Modal,
  Button,
  Card,
  ScrollArea,
  Avatar,
  Grid,
  Flex,
  Text,
} from "@mantine/core";
import B2bTable from "components/reusable/b2bTable";
import { Edit, Trash } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import { ShipmentAddModal } from "components/Shipment/ShipmentAddModal";
import ShipmentManageModal from "components/Shipment/ShipmentManageModal";
import { customLoader } from "components/utilities/loader";
import { DEL_SHIPMENT } from "apollo/mutuations";
import { IconMinus, IconPhone, IconPlus } from "@tabler/icons";

const Shipments = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const [checked, setChecked] = useState(true);
  const [selectedCollapse, setSelectedCollapse] = useState("");

  const theme = useMantineTheme();

  const { data, loading, fetchMore } = useQuery(GET_SHIPMENTS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  const [delShipment, { loading: delshipLoading }] = useMutation(DEL_SHIPMENT);

  const handleChange = (currentPage) => {
    fetchMore({
      variables: {
        first: size,
        page: currentPage,
      },
    });
    setActivePage(currentPage);
  };

  const headerData = [
    {
      label: "",
      key: "",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <span
            style={{
              cursor: "pointer",
              background: "#228be6",
              color: "white",
              padding: "3px",
              borderRadius: "50%",
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            {rowData.id !== selectedCollapse ? (
              <IconPlus
                size={16}
                onClick={() => {
                  setChecked(true);
                  setSelectedCollapse(rowData.id);
                  // prepareContent(rowData.id);
                }}
              />
            ) : (
              <IconMinus
                size={16}
                onClick={() => {
                  setChecked(false);
                  setSelectedCollapse("");
                }}
              />
            )}
          </span>
        );
      },
    },
    {
      label: "Id",
      key: "id",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.id}</span>;
      },
    },
    {
      label: "Departure Time",
      key: "departure_time",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.departure_time}</span>;
      },
    },
    {
      label: "Arrival Time",
      key: "arrival_time",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.arrival_time}</span>;
      },
    },
    {
      label: "Cost",
      key: "cost",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.cost}</span>;
      },
    },
    {
      label: "From",
      key: "from",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.from.name}</span>;
      },
    },
    {
      label: "To",
      key: "to",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.to.name}</span>;
      },
    },
    {
      label: "Status",
      key: "status",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <Badge
            color={
              rowData.status === "DELIVERED"
                ? "green"
                : rowData.status === "PENDING"
                ? "yellow"
                : `blue`
            }
          >
            {rowData.status}
          </Badge>
        );
      },
    },
    {
      label: "Actions",
      key: "actions",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <>
            <Trash color="#ed522f" size={24} onClick={() => handleDelete(`${rowData.id}`)} />
            <Edit
              size={24}
              onClick={() => handleManageShipment(`${rowData.id}`)}
            />
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Shipments",
    setAddModal: setOpened,
  };

  const prepareContent = (row) => {
    return (
      <tr>
        <td colSpan={headerData.length}>
          <Card shadow="sm" withBorder>
            <Grid grow>
              <Grid.Col span={4}>
                <Grid grow>
                  <Grid.Col span={4}>
                    <ScrollArea style={{ width: 300, height: 200 }}>
                      {row?.items?.map((data, idx) => (
                        <div key={idx}>
                          {data.shipment_itemable?.order?.items?.map(
                            (data, idx) => (
                              <Flex key={idx}>
                                <Card
                                  shadow="sm"
                                  p="sm"
                                  m="sm"
                                  radius="md"
                                  withBorder
                                >
                                  <Avatar.Group>
                                    {data.product_sku.product?.images?.map(
                                      (data, idx) => (
                                        <Avatar
                                          key={idx}
                                          src={data.original_url}
                                        />
                                      )
                                    )}
                                  </Avatar.Group>
                                </Card>
                                <Card
                                  shadow="sm"
                                  p="sm"
                                  m="sm"
                                  radius="md"
                                  withBorder
                                >
                                  <Text tt="capitalize">
                                    {data?.product_sku?.product?.name},
                                  </Text>
                                </Card>
                              </Flex>
                            )
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </Grid.Col>
                </Grid>
              </Grid.Col>
              <Grid.Col span={4}>
                <Flex
                  mih="100%"
                  gap="xl"
                  justify="center"
                  align="center"
                  direction="row"
                  wrap="wrap"
                >
                  <Group>
                    <Button variant="light" color="green" fullWidth radius="md">
                      From: {row.from.name}
                    </Button>

                    <Button variant="light" color="blue" fullWidth radius="md">
                      To: {row.to.name}
                    </Button>
                  </Group>
                </Flex>
              </Grid.Col>
              <Grid.Col span={4}>
                <Flex
                  mih="100%"
                  gap="xl"
                  justify="center"
                  align="center"
                  direction="row"
                  wrap="wrap"
                >
                  <Button
                    leftIcon={<IconPhone />}
                    color="green"
                    variant="green"
                  >
                    Call Driver
                  </Button>
                </Flex>
              </Grid.Col>
            </Grid>
          </Card>
        </td>
      </tr>
    );
  };

  if (!total && data) {
    setTotal(data.shipments.paginatorInfo.lastPage);
  }

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteShipment = () => {
    delShipment({
      variables: { id: deleteID },

      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Shipment Deleted Successfully",
        });
      },
      onError(error) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "red",
          title: "Error",
          message: `${error}`,
        });
      },
    });
  };

  const handleManageShipment = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };

  return loading ? (
    <LoadingOverlay
      visible={loading || delshipLoading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <div style={{ width: "98%", margin: "auto" }}>
      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this shipment?</p>
        <Group position="right">
          <Button onClick={() => deleteShipment()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Adding a Shipment"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <ShipmentAddModal
          total={total}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
        />
      </Drawer>
      <Drawer
        opened={openedEdit}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        onClose={() => setOpenedEdit(false)}
        title="Editing a Shipment"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <ShipmentManageModal
          openedEdit={openedEdit}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            optionsData={optionsData}
            loading={loading}
            data={data ? data.shipments.data : []}
            collapsible={checked}
            selectedCollapse={selectedCollapse}
            setSelectedCollapse={setSelectedCollapse}
            content={prepareContent}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Shipments;
