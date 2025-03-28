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
import { showNotification } from "@mantine/notifications";
import {
  Change_Supplier_BusinessStatus,
  CHANGE_USER_STATUS,
  DEL_USER,
} from "apollo/mutuations";
import { FiEdit, FiEye } from "react-icons/fi";
import { ManualGearbox, Trash } from "tabler-icons-react";
import EditIcon from "@mui/icons-material/Edit";
import { GET_ALL_USERS, GET_SUPPLIERS_Business } from "apollo/queries";
import Controls from "components/controls/Controls";
import B2bTable from "components/reusable/b2bTable";
import UserAddModal from "components/User/UserAddModal";
import UserEditModal from "components/User/UserEditModal";
import { customLoader } from "components/utilities/loader";
import React, { useEffect } from "react";
import { useState } from "react";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import SupplierFilter from "./supplierFilter";

const SuspendedSupplierBusiness = ({activeTab}) => {
  const [size, setSize] = useState("10");
  const [openedStatusChange, setStatusChange] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [status, setStatus] = useState(null);
  const [total, setTotal] = useState(0);
  const [supplier, setSupplier] = useState(null);

  const { data, loading, refetch } = useQuery(GET_SUPPLIERS_Business, {
    variables: {
      first: parseInt(size),
      page: activePage,
      status:"SUSPENDED",
      supplier_id: supplier,
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
      setTotal(data.suppliersBusinesses.paginatorInfo.lastPage);
    }
  }, [data, size]);
  useEffect(() => {
    if(activeTab ==='third')
    refetch();
  }, [activeTab]);


  const theme = useMantineTheme();

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
      label: "City",
      key: "city",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.city}</span>;
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
              title={rowData.status === "ACTIVE" ? "Deactivate" : "Activate"}
              onClick={() =>
                handleStatus(
                  rowData.id,
                  rowData.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
                )
              }
            >
              {rowData.status === "ACTIVE" ? (
                <PersonOffIcon size={17} />
              ) : (
                <HowToRegIcon size={17} />
              )}
            </Controls.ActionButton>
          </div>
        );
      },
    },
  ];
  const [changeUserStatus] = useMutation(Change_Supplier_BusinessStatus, {
    refetchQueries: [
      {
        query: GET_SUPPLIERS_Business,
        variables: {
          first: parseInt(size),
          page: activePage,
          status:"SUSPENDED",
          supplier_id: supplier,
          search: searchValue,
          ordered_by: [
            {
              column: "CREATED_AT",
              order: "DESC",
            },
          ],
        },
      },
    ],
    onCompleted(data) {
      const action =
        data.changeSupplierBusinessStatus.status === "ACTIVE"
          ? "Activated"
          : "Deactivated";
      showNotification({
        color: "green",
        title: "Success",
        message: `Supplier Business ${action} successfully`,
      });
      setStatusChange(false);
    },
    onError(error) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${error.message}`,
      });
    },
  });

  const handleUserStatusChange = () => {
    changeUserStatus({
      variables: {
        id: deleteID, // Ensure id is an integer
        status: status, // Toggle the status
      },
    });
  };

  const handleStatus = (id, status) => {
    setStatusChange(true);
    setDeleteID(id);
    setStatus(status);
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
            opened={openedStatusChange}
            onClose={() => setStatusChange(false)}
            title="Warning"
            centered
          >
            <p>{`Are you sure do you want ${
              status === "ACTIVE" ? "Activat" : "Deactivat"
            } this  user?`}</p>
            <Group position="right">
              <Button onClick={() => handleUserStatusChange()} color="red">
                {status === "ACTIVE" ? "Activat" : "Deactivat"}
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
                layout={{ minWidth: 700 }}
                data={data ? data.suppliersBusinesses.data : []}
                size={size}
                filterData={({ onCardClick }) => (
                  <SupplierFilter
                    supplier={supplier}
                    onCardClick={setSupplier}
                  />
                )}
                handlePageSizeChange={handlePageSizeChange}
              />
            </ScrollArea>
          </Card>
        </div>
  );
};

export default SuspendedSupplierBusiness;
