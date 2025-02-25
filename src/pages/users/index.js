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
import { CHANGE_USER_STATUS, DEL_USER } from "apollo/mutuations";
import { FiEdit, FiEye } from "react-icons/fi";
import { ManualGearbox, Trash } from "tabler-icons-react";
import EditIcon from "@mui/icons-material/Edit";
import { GET_ALL_USERS } from "apollo/queries";
import Controls from "components/controls/Controls";
import B2bTable from "components/reusable/b2bTable";
import UserAddModal from "components/User/UserAddModal";
import UserEditModal from "components/User/UserEditModal";
import { customLoader } from "components/utilities/loader";
import React, { useEffect } from "react";
import { useState } from "react";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import RoleFilter from "./roleFilter";

const Users = () => {
  const [size, setSize] = useState("10");
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedStatusChange, setStatusChange] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [status, setStatus] = useState(null);
  const [total, setTotal] = useState(0);
  const [roleId, setRoleId] = useState(null);

  const { data, loading } = useQuery(GET_ALL_USERS, {
    variables: {
      first: parseInt(size),
      page: activePage,
      search: searchValue,
      role: roleId,
    },
  });

  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };
  useEffect(() => {
    if (data) {
      setTotal(data.users.paginatorInfo.lastPage);
    }
  }, [data, size]);

  const [delUser] = useMutation(DEL_USER, {
    update(cache, { data: { deleteUser } }) {
      cache.updateQuery(
        {
          query: GET_ALL_USERS,
          variables: {
            first: 10,
            page: activePage,
            search: "",
          },
        },
        (data) => {
          if (data.users.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              users: {
                data: [
                  ...data.users.data.filter(
                    (user) => user.id !== deleteUser.id
                  ),
                ],
              },
            };
          }
        }
      );
    },
  });

  const theme = useMantineTheme();

  const headerData = [
    {
      label: "Avatar",
      key: "avatar",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <Avatar src={rowData.profile_image} />;
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
      label: "Phone",
      key: "Phone",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.phone}</span>;
      },
    },
    {
      label: "Email",
      key: "Email",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.email}</span>;
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
      label: "Roles",
      key: "roles",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return rowData.roles.map((data) => (
          <Badge key={data.id}>{data.name}</Badge>
        ));
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
  const [changeUserStatus] = useMutation(CHANGE_USER_STATUS, {
    refetchQueries: [
      {
        query: GET_ALL_USERS,
        variables: {
          first: 10,
          page: activePage,
        },
      },
    ],
    onCompleted(data) {
      const action =
        data.changeUserStatus.status === "ACTIVE" ? "Activated" : "Deactivated";
      showNotification({
        color: "green",
        title: "Success",
        message: `User ${action} successfully`,
      });
      setStatusChange(false)
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
  const optionsData = {
    actionLabel: "Add User",
    setAddModal: setOpened,
  };

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };
  const handleStatus = (id,status) => {
    setStatusChange(true);
    setDeleteID(id);
    setStatus(status)
  };

  const handleEditUser = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };

  const handleChange = (currentPage) => {
    setActivePage(currentPage);
  };

  const deleteUser = () => {
    delUser({
      variables: { id: deleteID },
      refetchQueries: [
        {
          query: GET_ALL_USERS,
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
          message: "User Deleted Successfully",
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
        opened={opened}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        padding="xl"
        onClose={() => setOpened(false)}
        position="left"
        size="40%"
        styles={{
          closeButton: {
            color: "black",
            marginTop: "50px",
          },
        }}
      >
        <UserAddModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
        />
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
        styles={{
          closeButton: {
            color: "black",
            marginTop: "50px",
          },
        }}
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="right"
        size="40%"
      >
        <UserEditModal
          setOpenedEdit={setOpenedEdit}
          editId={editId}
          data={data ? data.users.data : []}
        />
      </Drawer>
      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this user?</p>
        <Group position="right">
          <Button onClick={() => deleteUser()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={openedStatusChange}
        onClose={() => setStatusChange(false)}
        title="Warning"
        centered
      >
        <p>{`Are you sure do you want ${status==="ACTIVE" ? "Activat" : "Deactivat"} this  user?`}</p>
        <Group position="right">
          <Button onClick={() => handleUserStatusChange()} color="red">
            {status==="ACTIVE" ? "Activat" : "Deactivat"}
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
            optionsData={optionsData}
            loading={loading}
            data={data ? data.users.data : []}
            size={size}
            filterData={({ onCardClick }) => (
              <RoleFilter role={roleId} onCardClick={setRoleId} />
            )}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Users;
