import { useState } from "react";
import { Drawer, LoadingOverlay, useMantineTheme } from "@mantine/core";
import { ScrollArea, Group, Button, Card, Avatar, Modal } from "@mantine/core";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";

import { Trash, Edit } from "tabler-icons-react";
import WarehouseAddModal from "components/Warehouse/warehouseAddModal";
import WarehouseEditModal from "components/Warehouse/warehouseEditModal";
import { showNotification } from "@mantine/notifications";
import { customLoader } from "components/utilities/loader";
import { GET_WARE_HOUSE, GET_WARE_HOUSES } from "apollo/queries";
import { DEL_WAREHOUSE } from "apollo/mutuations";
import B2bTable from "components/reusable/b2bTable";

const Warehouses = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading } = useQuery(GET_WARE_HOUSES, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.warehouses.paginatorInfo.lastPage);
  }


  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };

  const [getWarehouse, { loading: singleWarehouseLoading }] =
    useLazyQuery(GET_WARE_HOUSE);

  const [delWarehouse] = useMutation(DEL_WAREHOUSE, {
    update(cache, { data: { deleteWarehouse } }) {

      cache.updateQuery(
        {
          query: GET_WARE_HOUSES,
          variables: {
            first: 10,
            page: activePage,
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
          message: "Category Deleted Successfully",
        });
        // refetch();
      },
    });
  };

  const handleEditCategory = (id) => {
    setEditId(id);
    setOpenedEdit(true);
  };

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
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.name}</span>;
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
      label: "Actions",
      key: "actions",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <>
            <Trash size={24} color="#ed522f" onClick={() => handleDelete(`${rowData.id}`)} />
            <Edit
              size={24}
              onClick={() => handleEditCategory(`${rowData.id}`)}
            />
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Warehouse",
    setAddModal: setOpened,
  };

  const theme = useMantineTheme();

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
        />
      </Drawer>

      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            data={data.warehouses.data}
            loading={loading}
            optionsData={optionsData}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Warehouses;
