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
import { DEL_CATEGORY, DEL_Product_CATEGORY } from "apollo/mutuations";
import { FiEdit, FiEye } from "react-icons/fi";
import EditIcon from "@mui/icons-material/Edit";
import { GET_CATEGORIES, GET_Product_CATEGORIES } from "apollo/queries";
import CategoryAddModal from "components/Category/categoryAddModal";
import CategoryEditModal from "components/Category/categoryEditModal";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import { useState, useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";
import CategoryDetailModal from "components/Category/categoryDetail";
import Controls from "components/controls/Controls";
import ProductCategoryAddModal from "./addCategory";
import { useViewportSize } from "@mantine/hooks";

const SupplierBusinessDetailModal = ({ id }) => {
  const { height } = useViewportSize();
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
  const { data, loading, fetchMore, refetch } = useQuery(
    GET_Product_CATEGORIES,
    {
      variables: {
        supplier_id: id,
        first: parseInt(size),
        page: activePage,
        ordered_by: [
          {
            column: "CREATED_AT",
            order: "DESC",
          },
        ],
      },
    }
  );

  const [delCategory] = useMutation(DEL_Product_CATEGORY, {
    update(cache, { data: { deleteSupplierProductCategory } }) {
      cache.updateQuery(
        {
          query: GET_Product_CATEGORIES,
          variables: {
            supplier_id: id,
            first: parseInt(size),
            page: activePage,
            ordered_by: [
              {
                column: "CREATED_AT",
                order: "DESC",
              },
            ],
          },
        },
        (data) => {
          if (data.supplierProductCategories.data.length === 1) {
            setTotal(total - 1);
            setActivePage(activePage - 1);
          } else {
            return {
              supplierProductCategories: {
                data: [
                  ...data.supplierProductCategories.data.filter(
                    (category) => category.id !== deleteSupplierProductCategory.id
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
          query: GET_Product_CATEGORIES,
          variables: {
            supplier_id: id,
            first: parseInt(size),
            page: activePage,
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
      setTotal(data.supplierProductCategories.paginatorInfo.lastPage);
    }
  }, [data, size]);
  useEffect(() => {
    refetch();
  }, []);
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
      label: "Category Name",
      key: "avatar",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.category.name}</span>;
      },
    },
    {
      label: "Business Nmae",
      key: "name",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.supplier.business_name}</span>;
      },
    },
    {
      label: "Business Type",
      key: "business_type",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.supplier.business_type}</span>;
      },
    },
    {
      label: "Phone Number",
      key: "productCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.supplier.business_phone_number}</span>;
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
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
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
          <ProductCategoryAddModal
            total={total}
            activePage={activePage}
            setActivePage={setActivePage}
            setOpened={setOpened}
            setTotal={setTotal}
            id={id}
            size={size}
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
              data={data ? data.supplierProductCategories.data : []}
              handlePageSizeChange={handlePageSizeChange}
              size={size}
            />
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default SupplierBusinessDetailModal;
