import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Drawer,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { DEL_VEHICLE } from "apollo/mutuations";
import EditIcon from "@mui/icons-material/Edit";

import { GET_VEHICLES } from "apollo/queries";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import VehicleAddModal from "components/Vehicle/VehicleAddModal";
import VehicleEditModal from "components/Vehicle/VehicleEditModal";
import { useEffect, useState } from "react";
import { Edit, Trash } from "tabler-icons-react";
import Controls from "components/controls/Controls";

const Vehicles = () => {
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  //
  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);

  const theme = useMantineTheme();

  const { data, loading, fetchMore } = useQuery(GET_VEHICLES, {
    // fetchPolicy: "no-cache",
    variables: {
      first: size,
      page: activePage,
    },
  });

  const [delVehicle] = useMutation(DEL_VEHICLE, {
    update(cache, { data: { deleteVehicle } }) {
      cache.updateQuery(
        {
          query: GET_VEHICLES,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.vehicles.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              vehicles: {
                data: [
                  ...data.vehicles.data.filter(
                    (vehicle) => vehicle.id !== deleteVehicle.id
                  ),
                ],
              },
            };
          }
        }
      );
    },
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!total && data) {
    setTotal(data.vehicles.paginatorInfo.lastPage);
  }

  const handleChange = (currentPage) => {
    fetchMore({
      variables: {
        first: size,
        page: currentPage,
      },
    });
    setActivePage(currentPage);
  };

  if (!hasMounted) {
    return null;
  }

  const headerData = [
    {
      label: "id",
      key: "id",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.id}</span>;
      },
    },

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
      label: "Owner Name",
      key: "owner_name",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.owner_name}</span>;
      },
    },
    {
      label: "Vehicle Type",
      key: "vehicle_type",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.vehicle_type.title}</span>;
      },
    },
    {
      label: "Plate Number",
      key: "plate_number",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.plate_number}</span>;
      },
    },
    {
      label: "Driver",
      key: "driver",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.driver.name}</span>;
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
            <Controls.ActionButton
              color="primary"
              title="Update"
              onClick={() => handleEditProduct(`${rowData.id}`)}
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
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Vehicle",
    setAddModal: setOpened,
  };

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteVehicle = () => {
    delVehicle({
      variables: { id: deleteID },
      onCompleted() {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Vehicle Deleted Successfully",
        });
      },

      onError(data) {
        console.log("ERROR FOR NOT DELETE", data);
        setOpenedDelete(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "vehicle Not Deleted",
        });
      },
    });
  };

  const handleEditProduct = (id) => {
    setOpenedEdit(true);
    setEditId(id);
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
      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this vehicle?</p>
        <Group position="right">
          <Button onClick={() => deleteVehicle()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
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
        title="Editing a Product"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <VehicleEditModal
          openedEdit={openedEdit}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>
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
        title="Addding a Vehicle"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <VehicleAddModal
          total={total}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
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
            data={data ? data.vehicles.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Vehicles;
