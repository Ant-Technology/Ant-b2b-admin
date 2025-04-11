import { useEffect, useState } from "react";
import { customLoader } from "components/utilities/loader";
import { useMutation, useQuery } from "@apollo/client";
import Controls from "../../components/controls/Controls";
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
import { FiEdit, FiEye } from "react-icons/fi";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";
import EditIcon from "@mui/icons-material/Edit";
import { showNotification } from "@mantine/notifications";
import {
  DEL_MANAGER,
  DEL_SHIPMENT,
  DEL_Shipping,
  DEL_SUPPLIER,
} from "apollo/mutuations";
import {
  GET_WARE_HOUSE_MANAGERS,
  GET_WARE_HOUSE_SHIPPING,
} from "apollo/queries";
import B2bTable from "components/reusable/b2bTable";
import WarehouseManagerAddModal from "components/WarehouseManager/WarehouseManagerAdd";
import WarehouseManagerEditModal from "components/WarehouseManager/WarehouseEditModal";
import ShippingAddModal from "components/warehouseShipping/addShipping";
import ShippingUpdateModal from "components/warehouseShipping/updateShipping copy";

const WarehouseShipping = () => {
  const [size, setSize] = useState("10");
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading, refetch } = useQuery(GET_WARE_HOUSE_SHIPPING, {
    variables: {
      first: parseInt(size),
      page: activePage,
      search: searchValue,
      warehouse_id: "",
      ordered_by: [
        {
          column: "CREATED_AT",
          order: "DESC",
        },
      ],
    },
  });

  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };
  useEffect(() => {
    if (data) {
      setTotal(data.myWarehouseShippingEstimations.paginatorInfo.lastPage);
    }
  }, [data, size]);
  useEffect(() => {
    refetch();
  }, []);
  const [delRetailer] = useMutation(DEL_Shipping, {
    update(cache, { data: { deleteWarehouseShippingEstimation } }) {
      cache.updateQuery(
        {
          query: GET_WARE_HOUSE_SHIPPING,
          variables: {
            first: parseInt(size),
            page: activePage,
            search: searchValue,
            warehouse_id: "",
            ordered_by: [
              {
                column: "CREATED_AT",
                order: "DESC",
              },
            ],
          },
        },
        (data) => {
          if (data.myWarehouseShippingEstimations.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              myWarehouseShippingEstimations: {
                data: [
                  ...data.myWarehouseShippingEstimations.data.filter(
                    (supplier) =>
                      supplier.id !== deleteWarehouseShippingEstimation.id
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

      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Shipping Deleted Successfully",
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
      label: "Category",
      key: "name",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.category?.name}</span>;
      },
    },
    {
      label: "Warehouse",
      key: "warehouse",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.warehouse.name}</span>;
      },
    },
    {
      label: "Days",
      key: "days",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.days}</span>;
      },
    },
    {
      label: "Hours",
      key: "hours",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.hours}</span>;
      },
    },
    {
      label: "Minuts",
      key: "minuts",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.minuts}</span>;
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
              onClick={() => handleEditRetailer(rowData)}
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
    actionLabel: "Add Shipping",
    setAddModal: setOpened,
  };
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
        title="Editing a Shippign Estimation"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <ShippingUpdateModal row={editId} setOpenedEdit={setOpenedEdit} />
      </Drawer>

      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this data?</p>
        <Group position="right">
          <Button onClick={() => deleteRetailer()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding a Shipping Estimation"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <ShippingAddModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
          size={size}
        />
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
            optionsData={optionsData}
            loading={loading}
            data={data ? data.myWarehouseShippingEstimations.data : []}
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default WarehouseShipping;
