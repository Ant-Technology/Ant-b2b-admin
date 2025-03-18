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
import { DEL_SUPPLIER, DEL_SUPPLIER_Commission } from "apollo/mutuations";
import { GET_SUPPLIERS, GET_SUPPLIERS_Commission } from "apollo/queries";
import B2bTable from "components/reusable/b2bTable";

import RetailerEditModal from "components/Retailer/RetailerEditModal";
import RetailerDetailModal from "components/Retailer/RetailerDetail";

import SupplierAddModal from "components/Supplier/SupplierAddModal";
import SupplierEditModal from "components/Supplier/SupplierEditModal";
import CommissionAddModal from "components/SupplierCommission/CommistionAddModal";
import CommissionEditModal from "components/SupplierCommission/CommistionEditModal";

const SupplierCommission = () => {
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

  const { data, loading } = useQuery(GET_SUPPLIERS_Commission, {
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
      setTotal(data.supplier_commissions.paginatorInfo.lastPage);
    }
  }, [data, size]);

  const [delRetailer] = useMutation(DEL_SUPPLIER_Commission, {
    update(cache, { data: { deleteSupplier } }) {
      cache.updateQuery(
        {
          query: GET_SUPPLIERS_Commission,
          variables: {
            first: parseInt(size),
            page: activePage,
            search: "",
          },
        },
        (data) => {
          if (data.supplier_commissions.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              supplier_commissions: {
                data: [
                  ...data.supplier_commissions.data.filter(
                    (supplier) => supplier.id !== deleteRetailer.id
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
          query: GET_SUPPLIERS_Commission,
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
          message: "Commission Deleted Successfully",
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
  const handleManageRetailer = (id) => {
    setEditId(id);
    setOpenedDetail(true);
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
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.supplier.user?.name}</span>;
      },
    },
    {
      label: "Email",
      key: "email",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.supplier.user?.email}</span>;
      },
    },
    {
      label: "City",
      key: "city",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.supplier.city}</span>;
      },
    },
    {
      label: "Commission Rate",
      key: "commission_rate",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.commission_rate}</span>;
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
            <span style={{ marginLeft: "1px" }}>
              <Controls.ActionButton
                color="primary"
                title="View Detail"
             //   onClick={() => handleManageRetailer(`${rowData.id}`)}
              >
                <FiEye fontSize="medium" />
              </Controls.ActionButton>
            </span>
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
    actionLabel: "Add Commission",
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
        title="Editing a Commission"
        onClose={() => setOpenedEdit(false)}
        styles={{
          closeButton: {
            color: "black",
            marginTop: "50px",
          },
        }}
        padding="xl"
        position="right"
        size="40%"
      >
        <CommissionEditModal commistion={editId} setOpenedEdit={setOpenedEdit} />
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
        title="Commission Detail"
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
        <p>Are you sure do you want to delete this Commission?</p>
        <Group position="right">
          <Button onClick={() => deleteRetailer()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        styles={{
          closeButton: {
            color: "black",
            marginTop: "50px",
          },
        }}
        padding="xl"
        position="right"
        size="40%"
      >
        <CommissionAddModal
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
            data={data ? data.supplier_commissions.data : []}
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default SupplierCommission;
