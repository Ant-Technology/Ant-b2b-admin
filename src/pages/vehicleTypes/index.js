import { useMutation, useQuery } from "@apollo/client";
import {
  Avatar,
  Badge,
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

import axios from "axios";
import { FiEdit, FiEye } from "react-icons/fi";
import { CHANGE_VEHICLE_TYPE_STATUS, DEL_VEHICLE_TYPES } from "apollo/mutuations";
import { GET_VEHICLE_TYPES } from "apollo/queries";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import VehicleTypeAddModal from "components/VehicleType/VehicleTypeAddModal";
import VehicleTypeEditModal from "components/VehicleType/VehicleTypeEditModal";
import React, { useEffect, useState } from "react";
import { Edit, Trash } from "tabler-icons-react";
import Controls from "components/controls/Controls";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';


const VehicleTypes = () => {
  const [size,setSize] = useState("10");
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);

  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading } = useQuery(GET_VEHICLE_TYPES, {
    variables: {
      first: parseInt(size),
      page: activePage,
    },
  });

  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };
  useEffect(() => {
    if (data) {
      setTotal(data.vehicleTypes.paginatorInfo.lastPage);
    }
  }, [data, size]); 

  const [delVehicleType] = useMutation(DEL_VEHICLE_TYPES, {
    update(cache, { data: { deleteVehicleType } }) {
      cache.updateQuery(
        {
          query: GET_VEHICLE_TYPES,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.vehicleTypes.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              vehicleTypes: {
                data: [
                  ...data.vehicleTypes.data.filter(
                    (vehicleType) => vehicleType.id !== deleteVehicleType.id
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

  const [changeVehicleTypeStatus] = useMutation(CHANGE_VEHICLE_TYPE_STATUS, {
    refetchQueries: [
      {
        query: GET_VEHICLE_TYPES,
        variables: {
          first: 10,
          page: activePage,
        },
      },
    ],
    onCompleted(data) {
      const action = data.changeVehicleTypeStatus.status=== "ACTIVE" ? "Activated" : "Deactivated";
      showNotification({
        color: "green",
        title: "Success",
        message: `VehicleType ${action} successfully`,
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
  const handleVehicleTypStatusChange = (id, currentStatus) => {
    let status;
    if (currentStatus === 'DEACTIVATED') {
      status = 'ACTIVE'
    }
    else{
      status = "DEACTIVATED"
    }
    changeVehicleTypeStatus({
      variables: {
        id: id,  // Ensure id is an integer
        status: status, // Toggle the status
      },
    });
  };

  const deleteVehicleType = () => {
    delVehicleType({
      variables: { id: deleteID },
      refetchQueries: [
        {
          query: GET_VEHICLE_TYPES,
          variables: {
            first: 10,
            page: 1,
          },
        },
      ],
      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "vehicle type deleted successfully",
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

  const handleEditVehicleType = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };

  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };
  const theme = useMantineTheme();

  const headerData = [

    {
      label: "Title",
      key: "title",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.title}</span>;
      },
    },
   
    {
      label: "Vehicles",
      key: "title",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.vehicleCount}</span>;
      },
    },
    {
      label: "Type",
      key: "type",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.type}</span>;
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
    //price_per_kilometer
    {
      label: "Starting Price",
      key: "starting_price",
      sortable: false,
      render: (rowData) => {
        return (
          <span>
            {rowData.starting_price}{" "}
            <span style={{ marginLeft: "7px" }}>ETB</span>
          </span>
        );
      },
    },
    {
      label: "Price Per Kilometer",
      key: "price_per_kilometer",
      sortable: false,
      render: (rowData) => {
        return (
          <span>
            {rowData.price_per_kilometer}{" "}
            <span style={{ marginLeft: "7px" }}>ETB</span>
          </span>
        );
      },
    },
    {
      label: "Image",
      key: "avatar",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <Avatar src={rowData.image} />;
      },
    },
    {
      label: "Actions",
      key: "actions",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <div style={{ display: "flex", width: "115px",}}>
            <Controls.ActionButton
              color="primary"
              title="Update"
              onClick={() => handleEditVehicleType(`${rowData.id}`)}
            >
              <EditIcon style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>

            <Controls.ActionButton
              color="primary"
              title="Delete"
              onClick={() => handleDelete(`${rowData.id}`)}
            >
              <Trash size={25} />
            </Controls.ActionButton>
            <Controls.ActionButton
              color="primary"
              title={rowData?.status ==="ACTIVE" ? "Deactivate" : "Activate"}
              onClick={() => handleVehicleTypStatusChange(rowData.id,rowData.status)}
            >
              {rowData.status==="ACTIVE" ? (
                <CancelIcon size={17} />
              ) : (
                <CheckCircleIcon size={17} />
              )}
            </Controls.ActionButton>
          </div>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add vehicle type",
    setAddModal: setOpened,
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
        title="Editing a VehicleType"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <VehicleTypeEditModal
          setOpenedEdit={setOpenedEdit}
          editId={editId}
          // loading={singleCategoryLoading}
        />
      </Drawer>
      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this vehicle type?</p>
        <Group position="right">
          <Button onClick={() => deleteVehicleType()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Addding a Vehicle Type"
        padding="xl"
        size="80%"
        position="bottom"
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
      >
        <VehicleTypeAddModal
          total={total}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
          setTotal={setTotal}
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
            data={data ? data.vehicleTypes.data : []}
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default VehicleTypes;