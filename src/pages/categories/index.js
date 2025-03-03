import { useMutation, useQuery } from "@apollo/client";
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
import { FiEdit, FiEye } from "react-icons/fi";
import EditIcon from "@mui/icons-material/Edit";
import { GET_CATEGORIES } from "apollo/queries";
import CategoryAddModal from "components/Category/categoryAddModal";
import CategoryEditModal from "components/Category/categoryEditModal";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";
import CategoryDetailModal from "components/Category/categoryDetail";
import Controls from "components/controls/Controls";

const Categories = () => {
  const [size, setSize] = useState("10"); // Default page size
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  //
  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);

  const theme = useMantineTheme();
  const [confirmedSearch, setConfirmedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const handleManualSearch = (searchTerm) => {
    setSearchValue(searchTerm);
  };
  const clearInput = () => {
    setSearchValue("");
    setConfirmedSearch("");
  };
  const { data, loading, fetchMore } = useQuery(GET_CATEGORIES, {
    // fetchPolicy: "no-cache",
    variables: {
      first: parseInt(size), // Pass size dynamically
      page: activePage,
      search:searchValue,
    },
  });

  const [delCategory] = useMutation(DEL_CATEGORY, {
    update(cache, { data: { deleteCategory } }) {
      cache.updateQuery(
        {
          query: GET_CATEGORIES,
          variables: {
            first: parseInt(size), // Use the same size variable
            page: activePage,
            search: "",
          },
        },
        (data) => {
          console.log(data)
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
    },
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
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };
  useEffect(() => {
    if (data) {
      setTotal(data.categories.paginatorInfo.lastPage);
    }
  }, [data, size]);

  const handleChange = (currentPage) => {
    fetchMore({
      variables: {
        first: parseInt(size),
        page: currentPage,
      },
    });
    setActivePage(currentPage);
  };
  if (!hasMounted) {
    return null;
  }
  const handleManageCategory = (id) => {
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
      label: "Avatar",
      key: "avatar",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <Avatar src={rowData.imageUrl} radius="xl" />;
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
      label: "Product Sku",
      key: "productSkusCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.productSkusCount}</span>;
      },
    },
    {
      label: "Products",
      key: "productCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.productCount}</span>;
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
              onClick={() => handleEditCategory(`${rowData.id}`)}
            >
              <EditIcon style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>
            <span style={{ marginLeft: "1px" }}>
              <Controls.ActionButton
                color="primary"
                title="View Detail"
                onClick={() => handleManageCategory(`${rowData.id}`)}
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
      <Drawer
        opened={openedDetail}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Category Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <CategoryDetailModal Id={editId} />
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
          setTotal={setTotal}
        />
      </Drawer>

      <Card shadow="sm" p="lg">
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            clearInput={clearInput}
            handelSearch={handleManualSearch}
            searchValue={confirmedSearch}
            onSearchChange={setConfirmedSearch}
            handleChange={handleChange}
            header={headerData}
            optionsData={optionsData}
            loading={loading}
            data={data ? data.categories.data : []}
            handlePageSizeChange={handlePageSizeChange}
            size={size}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Categories;
