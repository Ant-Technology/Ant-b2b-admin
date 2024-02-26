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
import { DEL_USER } from "apollo/mutuations";
import { GET_ALL_USERS } from "apollo/queries";
import B2bTable from "components/reusable/b2bTable";
import UserAddModal from "components/User/UserAddModal";
import UserEditModal from "components/User/UserEditModal";
import { customLoader } from "components/utilities/loader";
import React from "react";
import { useState } from "react";
import { Edit, Trash } from "tabler-icons-react";

const Users = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading } = useQuery(GET_ALL_USERS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.users.paginatorInfo.lastPage);
  }

  const [delUser] = useMutation(DEL_USER, {
    update(cache, { data: { deleteUser } }) {
      cache.updateQuery(
        {
          query: GET_ALL_USERS,
          variables: {
            first: 10,
            page: activePage,
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
      label: "id",
      key: "id",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.id}</span>;
      },
    },
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
      label: "Email",
      key: "Email",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.email}</span>;
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
          <>
            <Trash
              color="#ed522f"
              size={24}
              onClick={() => handleDelete(`${rowData.id}`)}
            />
            <Edit color="orange" size={24} onClick={() => handleEditUser(`${rowData.id}`)} />
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add User",
    setAddModal: setOpened,
  };

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
        title="Adding a User"
        padding="xl"
        onClose={() => setOpened(false)}
        position="left"
        size="40%"
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
        title="Editing a User"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="right"
        size="40%"
      >
        <UserEditModal setOpenedEdit={setOpenedEdit} editId={editId}  data={data ? data.users.data : []} />
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
      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            optionsData={optionsData}
            loading={loading}
            data={data ? data.users.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Users;
