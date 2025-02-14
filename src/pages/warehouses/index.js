import { useEffect, useState } from "react";
import { Badge, Drawer, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { ScrollArea, Group, Button, Card, Avatar, Modal } from "@mantine/core";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import axios from "axios";
import { FiEdit, FiEye } from "react-icons/fi";
import { Trash, Edit } from "tabler-icons-react";
import WarehouseAddModal from "components/Warehouse/warehouseAddModal";
import WarehouseEditModal from "components/Warehouse/warehouseEditModal";
import { showNotification } from "@mantine/notifications";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { customLoader } from "components/utilities/loader";
import { GET_WARE_HOUSE, GET_WARE_HOUSES } from "apollo/queries";
import { CHANGE_WAREHOUSE_STATUS, DEL_WAREHOUSE } from "apollo/mutuations";
import B2bTable from "components/reusable/b2bTable";
import ShowWarehouseLocation from "components/Warehouse/showWarehouseLocation";
import Controls from "components/controls/Controls";

const Warehouses = () => {
  const [size, setSize] = useState("10");
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedLocation, setOpenedLocation] = useState(false);
  const [location, setLocation] = useState({});

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const { data, loading, refetch } = useQuery(GET_WARE_HOUSES, {
    variables: {
      first: parseInt(size),
      page: activePage,
      search: searchValue,
    },
  });

  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };
  useEffect(() => {
    if (data) {
      setTotal(data.warehouses.paginatorInfo.lastPage);
    }
  }, [data, size]);

  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };
  const handleGeoLocationClick = (lat, lng) => {
    setLocation({
      lat: lat,
      lng: lng,
    });
    setOpenedLocation(true);
  };
  const [getWarehouse, { loading: singleWarehouseLoading }] =
    useLazyQuery(GET_WARE_HOUSE);

  const [delWarehouse] = useMutation(DEL_WAREHOUSE, {
    update(cache, { data: { deleteWarehouse } }) {
      cache.updateQuery(
        {
          query: GET_WARE_HOUSES,
          variables: {
            first: parseInt(size),
            page: activePage,
            search:""
          },
        },
        (data) => {
          if (data.warehouses.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              warehouses: {
                data: [
                  ...data.warehouses.data.filter(
                    (warehouse) => warehouse.id !== deleteWarehouse.id
                  ),
                ],
              },
            };
          }
        }
      );
    },
  });

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteWarehouse = () => {
    delWarehouse({
      variables: { id: deleteID },

      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Warehouse Deleted Successfully",
        });
        // refetch();
      },
    });
  };

  const handleEditCategory = (id) => {
    setEditId(id);
    setOpenedEdit(true);
  };

  const [changeWarehouseStatus] = useMutation(CHANGE_WAREHOUSE_STATUS, {
    refetchQueries: [
      {
        query: GET_WARE_HOUSES,
        variables: {
          first: 10,
          page: activePage,
        },
      },
    ],
    onCompleted(data) {
      const action =
        data.changeWarehouseStatus.status === "ACTIVE"
          ? "Activated"
          : "Deactivated";
      showNotification({
        color: "green",
        title: "Success",
        message: `Warehouse ${action} successfully`,
      });
    },
    onError(error) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${error.message}`,
      });
    },
  });
  const handleWarehouseStatusChange = (id, currentStatus) => {
    let status;
    if (currentStatus === "DEACTIVATED") {
      status = "ACTIVE";
    } else {
      status = "DEACTIVATED";
    }
    changeWarehouseStatus({
      variables: {
        id: id, // Ensure id is an integer
        status: status, // Toggle the status
      },
    });
  };

  const headerData = [
    {
      label: "Name",
      key: "name",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.name}</span>;
      },
    },
    {
      label: "Region",
      key: "region",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.region?.name}</span>;
      },
    },
    {
      label: "Specific Area",
      key: "specific_area",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.specific_area}</span>;
      },
    },

    {
      label: "Stock count",
      key: "name",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.stocks?.length}</span>;
      },
    },
    {
      label: "Location",
      key: "geo",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        const { lat, lng } = rowData._geo;
        return (
          <span style={{ cursor: "pointer" }}>
            [{lat}, {lng}]
            <div
              onClick={() => handleGeoLocationClick(lat, lng)}
              style={{ cursor: "pointer", color: "rgb(20, 61, 93)" }}
            >
              View Map
            </div>
          </span>
        );
      },
    },

    {
      label: "Status",
      key: "status",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <span>
            {rowData.status === "ACTIVE" ? (
              <Badge variant="light" color="green">
                Active
              </Badge>
            ) : (
              <Badge variant="light" color="red">
                Not Active
              </Badge>
            )}
          </span>
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
          <div style={{ display: "flex" }}>
            <Controls.ActionButton
              color="primary"
              title="Update"
              onClick={() => handleEditCategory(`${rowData.id}`)}
            >
              <EditIcon style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>

            <Controls.ActionButton
              color="primary"
              title="Delete"
              onClick={() => handleDelete(`${rowData.id}`)}
            >
              <Trash size={17} />
            </Controls.ActionButton>

            <Controls.ActionButton
              color="primary"
              title={rowData?.status === "ACTIVE" ? "Deactivate" : "Activate"}
              onClick={() =>
                handleWarehouseStatusChange(rowData.id, rowData.status)
              }
            >
              {rowData.status === "ACTIVE" ? (
                <CancelIcon size={15} />
              ) : (
                <CheckCircleIcon size={15} />
              )}
            </Controls.ActionButton>
          </div>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Warehouse",
    setAddModal: setOpened,
  };

  const theme = useMantineTheme();
  const [confirmedSearch, setConfirmedSearch] = useState("");

  const handleManualSearch = (searchTerm) => {
    setSearchValue(searchTerm);
  };
  const clearInput = () => {
    setSearchValue("");
    setConfirmedSearch("");
  };
  return loading ? (
    <LoadingOverlay
      visible={loading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <div style={{ width: "98%", margin: "auto" }}>
      <Drawer
        opened={openedEdit}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Editing  warehouse"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <WarehouseEditModal
          openedEdit={openedEdit}
          setOpenedEdit={setOpenedEdit}
          loading={singleWarehouseLoading}
          getWarehouse={getWarehouse}
          editId={editId}
        />
      </Drawer>

      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this warehouse?</p>
        <Group position="right">
          <Button onClick={() => deleteWarehouse()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding a warehouse"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <WarehouseAddModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
          refetch={refetch}
        />
      </Drawer>

      <Drawer
        opened={openedLocation}
        onClose={() => setOpenedLocation(false)}
        title="Warehouse Location"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <ShowWarehouseLocation location={location} />
      </Drawer>

      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            clearInput={clearInput}
            handelSearch={handleManualSearch}
            searchValue={confirmedSearch}
            onSearchChange={setConfirmedSearch}
            header={headerData}
            data={data.warehouses.data}
            loading={loading}
            optionsData={optionsData}
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Warehouses;
