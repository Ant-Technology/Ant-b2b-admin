import { useState } from "react";
import { customLoader } from "components/utilities/loader";
import { useMutation, useQuery } from "@apollo/client";
import {
  Card,
  Button,
  ScrollArea,
  useMantineTheme,
  LoadingOverlay,
  Drawer,
  Group,
  Modal,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { DEL_RETAILER } from "apollo/mutuations";
import { GET_RETAILERS } from "apollo/queries";
import RetailerAddModal from "components/Retailer/RetailerAddModal";
import B2bTable from "components/reusable/b2bTable";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";
import RetailerEditModal from "components/Retailer/RetailerEditModal";
import RetailerDetailModal from "components/Retailer/RetailerDetail";

const Retailers = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading } = useQuery(GET_RETAILERS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.retailers.paginatorInfo.lastPage);
  }

  const [delRetailer] = useMutation(DEL_RETAILER, {
    update(cache, { data: { deleteRetailer } }) {
      cache.updateQuery(
        {
          query: GET_RETAILERS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.retailers.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              retailers: {
                data: [
                  ...data.retailers.data.filter(
                    (retailer) => retailer.id !== deleteRetailer.id
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

  const deleteRetailer = () => {
    delRetailer({
      variables: { id: deleteID },
      refetchQueries: [
        {
          query: GET_RETAILERS,
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
          message: "Product Deleted Successfully",
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

  const handleEditRetailer = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };

  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };
  const theme = useMantineTheme();
  const handleManageRetailer = (id)=>{
    setEditId(id);
    setOpenedDetail(true);
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
      label: "City",
      key: "city",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.city}</span>;
      },
    },
    {
      label: "Phone",
      key: "city",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.city}</span>;
      },
    },
    {
      label: "Email",
      key: "email",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.contact_email}</span>;
      },
    },
    {
      label: "Region",
      key: "city",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span style={{ marginLeft: "25px" }}>{rowData.city}</span>;
      },
    },
    {
      label: "Orders",
      key: "city",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.city}</span>;
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
            <Trash
              color="#ed522f"
              size={24}
              onClick={() => handleDelete(`${rowData.id}`)}
            />
            <Edit
              style={{
                cursor: "pointer",
                marginLeft: "10px",
              }}
              size={24}
              onClick={() => handleEditRetailer(`${rowData.id}`)}
            />
            <ManualGearbox
              color="#1971C2"
              style={{
                cursor: "pointer",
                marginLeft: "10px",
              }}
              size={24}
              onClick={() => handleManageRetailer(`${rowData.id}`)}
            />
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Retailer",
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
        title="Editing a Retailer"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <RetailerEditModal setOpenedEdit={setOpenedEdit} editId={editId} />
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
        title="Retailer Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <RetailerDetailModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpenedDetail={setOpenedDetail}
          Id={editId}
        />
      </Drawer>

      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this retailer?</p>
        <Group position="right">
          <Button onClick={() => deleteRetailer()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding a Retailer"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <RetailerAddModal
          total={total}
          setTotal={setTotal}
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
            data={data ? data.retailers.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Retailers;
