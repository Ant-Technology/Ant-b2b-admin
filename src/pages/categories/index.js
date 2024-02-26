import {  useMutation, useQuery } from "@apollo/client";
import {
  LoadingOverlay,
  Modal,
  Drawer,
  Button,
  ScrollArea,
  useMantineTheme,
  Card,
  Group,
  Avatar,
} from "@mantine/core";
import { DEL_CATEGORY } from "apollo/mutuations";
import { GET_CATEGORIES } from "apollo/queries";
import CategoryAddModal from "components/Category/categoryAddModal";
import CategoryEditModal from "components/Category/categoryEditModal";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import { Edit, Trash } from "tabler-icons-react";

const Categories = () => {
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  //
  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);

  const theme = useMantineTheme();

  const { data, loading, fetchMore } = useQuery(GET_CATEGORIES, {
    // fetchPolicy: "no-cache",
    variables: {
      first: size,
      page: activePage,
    },
  });

  

  const [delCategory] = useMutation(DEL_CATEGORY, {
    update(cache, { data: { deleteCategory } }) {

        cache.updateQuery(
          {
            query: GET_CATEGORIES,
            variables: {
              first: 10,
              page: activePage,
            },
          },
          (data) => {
            if (data.categories.data.length === 1) {
              setTotal(total - 1);
              setActivePage(activePage - 1);
            } else {
              return {
                categories: {
                  data: [
                    ...data.categories.data.filter(
                      (category) => category.id !== deleteCategory.id
                    ),
                  ],
                },
              };
            }
          }
        );
      }
  });

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteCategory = () => {
    delCategory({
      variables: { id: deleteID },
      refetchQueries: [
        {
          query: GET_CATEGORIES,
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
          message: "Category Deleted Successfully",
        });
      },
    });
  };

  const handleEditCategory = (id) => {
    setEditId(id);
    setOpenedEdit(true);
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!total && data) {
    setTotal(data.categories.paginatorInfo.lastPage);
  }

  const handleChange = (currentPage) => {
    fetchMore({
      variables: {
        first: size,
        page: currentPage,
      },
    });
    setActivePage(currentPage);
  };
  if (!hasMounted) {
    return null;
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
      label: "Avatar",
      key: "avatar",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <Avatar src={rowData.image} alt="avatar" />;
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
      label: "Actions",
      key: "actions",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <>
            <Trash color="#ed522f" size={24} onClick={() => handleDelete(`${rowData.id}`)} />
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
    actionLabel: "Add a Category",
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
        title="Editing a Category"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <CategoryEditModal
        setOpenedEdit={setOpenedEdit}
        editId={editId}
        // loading={singleCategoryLoading}
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
          <Button onClick={() => deleteCategory()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Addding a Category"
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
        <CategoryAddModal
          total={total}
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
            data={data ? data.categories.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Categories;
