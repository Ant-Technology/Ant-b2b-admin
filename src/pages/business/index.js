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
  Tabs,
  useMantineTheme,
} from "@mantine/core";
import { FiEdit, FiEye } from "react-icons/fi";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";
import EditIcon from "@mui/icons-material/Edit";
import { GET_MY_SUPPLIERS_Business } from "apollo/queries";
import Controls from "components/controls/Controls";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import React, { useEffect } from "react";
import { useState } from "react";
import SupplierBusinessAddModal from "components/SupplierBusiness/SupplierBussinessAddModal";
import { showNotification } from "@mantine/notifications";
import { DEL_BUSINESS } from "apollo/mutuations";
import SupplierBusinessDetailModal from "components/SupplierBusiness/SupplierDetail";

const BusinessManagment = () => {
  const [size, setSize] = useState("10");
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);

  const [editId, setEditId] = useState();
  const [opened, setOpened] = useState(false);
  const [deleteID, setDeleteID] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading, refetch } = useQuery(GET_MY_SUPPLIERS_Business, {
    variables: {
      first: parseInt(size),
      page: activePage,
      search: searchValue,
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
      setTotal(data.myBusinesses.paginatorInfo.lastPage);
    }
  }, [data, size]);
  useEffect(() => {
    refetch();
  }, []);

  const handleManageBusiness = (id) => {
    setEditId(id);
    setOpenedDetail(true);
  };
  const headerData = [
    {
      label: "Name",
      key: "business_name",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.business_name}</span>;
      },
    },
    {
      label: "Phone",
      key: "business_phone_number",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.business_phone_number}</span>;
      },
    },

    {
      label: "Type",
      key: "business_type",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.business_type}</span>;
      },
    },
    {
      label: "Warehouse",
      key: "number_of_warehouses",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return (
          <span style={{ display: "block", width: "30px" }}>
            {rowData.number_of_warehouses}
          </span>
        );
      },
    },
    {
      label: "Tin",
      key: "tin",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.tin}</span>;
      },
    },
    {
      label: "Supplier Code",
      key: "supplier_code",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.supplier_code}</span>;
      },
    },
    {
      label: "Status",
      key: "account",
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
      label: "Email",
      key: "business_email",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.business_email}</span>;
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
              onClick={() => handleEditUser(`${rowData.id}`)}
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
              title="View Detail"
              onClick={() => handleManageBusiness(`${rowData.id}`)}
            >
              <FiEye style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>
          </div>
        );
      },
    },
  ];

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const handleEditUser = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };

  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };

  const [confirmedSearch, setConfirmedSearch] = useState("");

  const handleManualSearch = (searchTerm) => {
    setSearchValue(searchTerm);
  };
  const clearInput = () => {
    setSearchValue("");
    setConfirmedSearch("");
  };

  const optionsData = {
    actionLabel: "Add a Business",
    setAddModal: setOpened,
  };
  const theme = useMantineTheme();

  const [delCategory] = useMutation(DEL_BUSINESS, {
    update(cache, { data: { deleteSupplierBusiness } }) {
      cache.updateQuery(
        {
          query: GET_MY_SUPPLIERS_Business,
          variables: {
            first: parseInt(size),
            page: activePage,
            search: "",
            ordered_by: [
              {
                column: "CREATED_AT",
                order: "DESC",
              },
            ],
          },
        },
        (data) => {
          if (data.myBusinesses.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              myBusinesses: {
                data: [
                  ...data.myBusinesses.data.filter(
                    (category) => category.id !== deleteSupplierBusiness.id
                  ),
                ],
              },
            };
          }
        }
      );
    },
  });

  const deleteBusines = () => {
    delCategory({
      variables: { id: deleteID },
      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Business Deleted Successfully",
        });
      },
    });
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
        opened={opened}
        onClose={() => setOpened(false)}
        title="Addding a Business"
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
        <SupplierBusinessAddModal
          total={total}
          size={size}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
          setTotal={setTotal}
        />
      </Drawer>
      <Drawer
        opened={openedDetail}
        onClose={() => setOpenedDetail(false)}
        title="Business Detail"
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
        <SupplierBusinessDetailModal
          id={editId}
        />
      </Drawer>

      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this category?</p>
        <Group position="right">
          <Button onClick={() => deleteBusines()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            clearInput={clearInput}
            handelSearch={handleManualSearch}
            searchValue={confirmedSearch}
            onSearchChange={setConfirmedSearch}
            loading={loading}
            optionsData={optionsData}
            layout={{ minWidth: 700 }}
            data={data ? data.myBusinesses.data : []}
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default BusinessManagment;
