import React, { useEffect, useState } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import { FiEdit, FiEye } from "react-icons/fi";

import B2bTable from "components/reusable/b2bTable";
import { Edit, Trash, DotsCircleHorizontal } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import { ShipmentAddModal } from "components/Shipment/ShipmentAddModal";
import ShipmentManageModal from "components/Shipment/ShipmentManageModal";
import { customLoader } from "components/utilities/loader";
import { DEL_SHIPMENT, MARK_AS_DELIVERED_SELF_SHIPMENT } from "apollo/mutuations";
import { IconMinus, IconPhone, IconPlus } from "@tabler/icons";
import ShipmentCard from "./card";
import Controls from "components/controls/Controls";
import UpdateIcon from '@mui/icons-material/Update';
import SalesDetailModal from "components/Sales/SalesDetailModal";
import ShipmentDetail from "components/Shipment/ShipmentDetail";
const Shipments = () => {
  const [size,setSize] = useState("10");
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const[rowData,setRowData] = useState(null)
  const handleShipmentDetail = (row) => {    
    setRowData(row)
    setOpenedDetail(true);
  };
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const [checked, setChecked] = useState(true);
  const [selectedCollapse, setSelectedCollapse] = useState("");

  const theme = useMantineTheme();

  const { data, loading, fetchMore,refetch } = useQuery(GET_SHIPMENTS, {
    variables: {
      first:parseInt(size),
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
      style: { width: '100px' } // Set the desired width for the "Cost" column
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
          <div style={{display:"flex",width:"155px"}}>
            <Controls.ActionButton
              color="primary"
              title="Update"
              onClick={() => handleManageShipment(`${rowData.id}`)}
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
            {rowData.self_shipment &&  rowData.status === "PENDING" &&
              <Controls.ActionButton
              color="primary"
              title="Update Status"
              onClick={() => handleChangeShipmentStatus(`${rowData.id}`)}
            >
              <UpdateIcon style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>}
            <span style={{ marginLeft: "1px" }}>
            <Controls.ActionButton
              color="primary"
              title="View Detail"
              onClick={() => handleShipmentDetail(rowData)}

            >
              <FiEye fontSize="medium" />
            </Controls.ActionButton>
          </span>
          </div>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Shipments",
    setAddModal: setOpened,
  };

  const [markAsDelivered] = useMutation(MARK_AS_DELIVERED_SELF_SHIPMENT, {
    onCompleted: (data) => {
      console.log('Shipment status updated:', data);
      refetch(); // Refetch shipments after successful update
    },
    onError: (error) => {
      console.error('Error updating shipment status:', error);
      // Handle error, e.g., show an error message
    },
  });

  const handleChangeShipmentStatus = (shipmentId) => {
    markAsDelivered({
      variables: { shipment_id: shipmentId },
    });
  };     
  
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };
  useEffect(() => {
    if (data) {
      setTotal(data.shipments.paginatorInfo.lastPage);
    }
  }, [data, size]); 

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
    <div style={{ width:"1240px", overflowX: 'hidden' , margin: "auto" }}>
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
        opened={openedDetail}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Shipment Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <ShipmentDetail refetch ={refetch} setOpenedDetail={setOpenedDetail} row={rowData} />
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
        <ShipmentCard />
        <ScrollArea style={{ overflowX: 'hidden' }}>
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
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Shipments;
