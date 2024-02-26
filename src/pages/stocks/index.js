import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  LoadingOverlay,
  Drawer,
  Group,
  useMantineTheme,
  Modal,
  Button,
  Card,
  ScrollArea,
} from "@mantine/core";
import { GET_STOCKS } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import ManageStock from "components/Stock/ManageStock";
import B2bTable from "components/reusable/b2bTable";
import StockAddModal from "components/Stock/StockAddModal";
import { ManualGearbox, Trash } from "tabler-icons-react";
import { showNotification } from "@mantine/notifications";
import { DEL_STOCK } from "apollo/mutuations";

const Stocks = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);

//   const [warehouse, setWarehouse] = useState();

  const theme = useMantineTheme();

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading, fetchMore } = useQuery(GET_STOCKS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.stocks.paginatorInfo.lastPage);
  }

  // delete mutation
  const [delStock] = useMutation(DEL_STOCK, {
    update(cache, { data: { deleteStock } }) {
      cache.updateQuery(
        {
          query: GET_STOCKS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.stocks.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              stocks: {
                data: [
                  ...data.stocks.data.filter(
                    (stock) => stock.id !== deleteStock.id
                  ),
                ],
              },
            };
          }
        }
      );
    },
  });

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
      label: "id",
      key: "id",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.id}</span>;
      },
    },
    {
      label: "Product Sku",
      key: "product_sku",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.product_sku.sku}</span>;
      },
    },
    {
      label: "Warehouse",
      key: "warehouse",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.warehouse.name}</span>;
      },
    },
    {
      label: "Quantity",
      key: "quantity",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.quantity}</span>;
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
            <ManualGearbox
              size={24}
              onClick={() =>
                handleManageRetailer(
                  `${rowData.id}`,
                  `${rowData.warehouse.name}`
                )
              }
            />
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Stock",
    setAddModal: setOpened,
  };

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteStock = () => {
    delStock({
      variables: { id: deleteID },

      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Stock Deleted Successfully",
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

  const handleManageRetailer = (id, wh) => {
    setEditId(id);
    // setWarehouse(wh);
    setOpenedEdit(true);
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
        title="Editing Stock"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <ManageStock
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>

      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this stock?</p>
        <Group position="right">
          <Button onClick={() => deleteStock()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding Stock"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <StockAddModal
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
            data={data ? data.stocks.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Stocks;
