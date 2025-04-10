import { useMutation, useQuery } from "@apollo/client";
import {
  Avatar,
  Card,
  Button,
  ScrollArea,
  LoadingOverlay,
  Group,
  useMantineTheme,
  Modal,
  Drawer,
} from "@mantine/core";
import { FiEdit, FiEye } from "react-icons/fi";
import EditIcon from "@mui/icons-material/Edit";

import { showNotification } from "@mantine/notifications";
import { DEL_PRODUCT } from "apollo/mutuations";
import {
  FILTER_PRODUCT_BY_CATEGORY,
  GET_MY_PRODUCTS,
  GET_PRODUCTS,
} from "apollo/queries";
import ProductDetailModal from "components/Product/ProductDetail";
import ProductAddModal from "components/Product/productAddModal";
import ProductEditModal from "components/Product/productEditModal";
import Controls from "components/controls/Controls";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import React, { useEffect, useState } from "react";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";
import CategoryFilter from "./categoryfilter";

const Products = () => {
  const [size, setSize] = useState("10");
  const [categoryId, setCategoryId] = useState(null);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [confirmedSearch, setConfirmedSearch] = useState("");
  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);
  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const hasSupplierPermission = roles.some(
    (permission) =>
      permission === "supplier" || permission === "warehouse_manager"
  );
  const theme = useMantineTheme();
  const handleManageProduct = (id) => {
    setEditId(id);
    setOpenedDetail(true);
  };
  const { data, loading, fetchMore, refetch } = useQuery(GET_MY_PRODUCTS, {
    variables: {
      category_id: categoryId,
      first: parseInt(size),
      page: activePage,
      ordered_by: [
        {
          column: "CREATED_AT",
          order: "DESC",
        },
      ],
      search: searchValue,
    },

    onCompleted: (data) => {
      if (hasSupplierPermission) {
        setTotal(data?.myProducts.paginatorInfo.lastPage);
      } else {
        setTotal(data?.products.paginatorInfo.lastPage);
      }
    },

    onError: (error) => {
      console.error("Query encountered an error:", error);
    },
  });
  useEffect(() => {
    refetch();
  }, []);
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };

  const [delProduct] = useMutation(DEL_PRODUCT, {
    update(cache, { data: { deleteProduct } }) {
      cache.updateQuery(
        {
          query: !hasSupplierPermission ? GET_PRODUCTS : GET_MY_PRODUCTS,
          variables: {
            category_id: categoryId,
            first: parseInt(size),
            page: activePage,
            ordered_by: [
              {
                column: "CREATED_AT",
                order: "DESC",
              },
            ],
            search: searchValue,
          },
        },
        (data) => {
          if (!hasSupplierPermission) {
            if (data.products.data.length === 1) {
              setTotal(total - 1);
              setActivePage(activePage - 1);
            } else {
              return {
                products: {
                  data: [
                    ...data.products.data.filter(
                      (product) => product.id !== deleteProduct.id
                    ),
                  ],
                },
              };
            }
          } else {
            if (data.myProducts.data.length === 1) {
              setTotal(total - 1);
              setActivePage(activePage - 1);
            } else {
              return {
                myProducts: {
                  data: [
                    ...data.myProducts.data.filter(
                      (product) => product.id !== deleteProduct.id
                    ),
                  ],
                },
              };
            }
          }
        }
      );
    },
  });

  useEffect(() => {
    setHasMounted(true);
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
        return (
          <Avatar.Group spacing="sm">
            <Avatar src={rowData?.images[0].original_url} radius="xl" />
          </Avatar.Group>
        );
      },
    },
    {
      label: "Name",
      key: "name",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.name}</span>;
      },
    },
    {
      label: "Category",
      key: "category",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.category?.name}</span>;
      },
    },
    {
      label: "Product Variant",
      key: "variantCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.productSkusCount}</span>;
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
              onClick={() => handleEditProduct(`${rowData.id}`)}
            >
              <EditIcon style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>
            <span style={{ marginLeft: "1px" }}>
              <Controls.ActionButton
                color="primary"
                title="View Detail"
                onClick={() => handleManageProduct(`${rowData.id}`)}
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
    actionLabel: "Add Product",
    setAddModal: setOpened,
  };

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteProduct = () => {
    delProduct({
      variables: { id: deleteID },
      onCompleted() {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Product Deleted Successfully",
        });
      },

      onError(data) {
        setOpenedDelete(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Product Not Deleted",
        });
      },
    });
  };

  const handleEditProduct = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };

  const handleManualSearch = (searchTerm) => {
    setSearchValue(searchTerm);
  };
  console.log(categoryId);
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
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this product?</p>
        <Group position="right">
          <Button onClick={() => deleteProduct()} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Drawer
        opened={openedDetail}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Product Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <ProductDetailModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpenedDetail={setOpenedDetail}
          Id={editId}
        />
      </Drawer>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Addding a Product"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <ProductAddModal
          total={total}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
          category_id={categoryId}
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
        onClose={() => setOpenedEdit(false)}
        title="Editing a Product"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <ProductEditModal
          openedEdit={openedEdit}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>
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
            filterData={({ onCardClick }) => (
              <CategoryFilter
                category={categoryId}
                onCardClick={setCategoryId}
              />
            )}
            data={
              hasSupplierPermission
                ? data.myProducts.data
                : data?.products?.data || []
            }
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Products;
