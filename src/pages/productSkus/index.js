import { useMutation, useQuery } from "@apollo/client";
import {
  Badge,
  ScrollArea,
  Group,
  useMantineTheme,
  Card,
  Drawer,
  Button,
  Modal,
  LoadingOverlay,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { DEL_PRODUCT_SKU } from "apollo/mutuations";
import { GET_PRODUCT_SKUS } from "apollo/queries";
import ProductSkuAddModal from "components/ProductSku/ProductSkuAddModal";
import ProductSkuEditModal from "components/ProductSku/ProductSkuEditModal";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import { useState, useEffect } from "react";
import { Edit, Trash } from "tabler-icons-react";

const ProductSkus = () => {
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

  const { data, loading, fetchMore } = useQuery(GET_PRODUCT_SKUS, {
    //   fetchPolicy: "no-cache",
    variables: {
      first: size,
      page: activePage,
    },
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!total && data) {
    setTotal(data.productSkus.paginatorInfo.lastPage);
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
      label: "SKU",
      key: "sku",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.sku}</span>;
      },
    },
    {
      label: "Variant",
      key: "variant",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.variants?.length}</span>;
      },
    },

    {
      label: "Product Name",
      key: "product.name",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.product.name}</span>;
      },
    },
    {
      label: "Category",
      key: "product.name",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.product.name}</span>;
      },
    },
    {
      label: "Price",
      key: "price",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.price}</span>;
      },
    },
    {
      label: "Is Active",
      key: "is_active",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return rowData.is_active ? (
          <Badge variant="light" color="green">
            Active
          </Badge>
        ) : (
          <Badge variant="light" color="red">
            Not Active
          </Badge>
        );
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
            <Edit
              size={24}
              onClick={() => handleEditProduct(`${rowData.id}`)}
            />
          </>
        );
      },
    },
  ];

  const optionsData = {
    actionLabel: "Add Product Variant",
    setAddModal: setOpened,
  };

  const [delProductSku, { loading: delLoading }] = useMutation(
    DEL_PRODUCT_SKU,
    {
      update(cache, { data: { deleteProductSku } }) {
        cache.updateQuery(
          {
            query: GET_PRODUCT_SKUS,
            variables: {
              first: 10,
              page: activePage,
            },
          },
          (data) => {
            if (data.productSkus.data.length === 1) {
              setTotal(total - 1);
              setActivePage(activePage - 1);
            } else {
              return {
                productSkus: {
                  data: [
                    ...data.productSkus.data.filter(
                      (productsku) => productsku.id !== deleteProductSku.id
                    ),
                  ],
                },
              };
            }
          }
        );
      },
    }
  );

  const handleDelete = (id) => {
    setOpenedDelete(true);
    setDeleteID(id);
  };

  const deleteCategory = () => {
    delProductSku({
      variables: { id: deleteID },
      onCompleted(data) {
        setOpenedDelete(false);
        setDeleteID(null);
        showNotification({
          color: "green",
          title: "Success",
          message: "Product variant Deleted!",
        });
      },
      onError(data) {
        setOpenedDelete(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Product variant Not Deleted!",
        });
      },
    });
  };
  const handleEditProduct = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };
  if (!hasMounted) {
    return null;
  }

  return loading ? (
    <LoadingOverlay
      visible={loading || delLoading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <div style={{ width: "98%", margin: "auto" }}>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding Product Variant"
        padding="xl"
        size="60%"
        position="bottom"
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
      >
        <ProductSkuAddModal
          total={total}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
        />
      </Drawer>
      <Drawer
        opened={openedEdit}
        onClose={() => setOpenedEdit(false)}
        title="Editing Product Variant"
        padding="xl"
        size="60%"
        position="bottom"
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
      >
        <ProductSkuEditModal setOpenedEdit={setOpenedEdit} editId={editId} />
      </Drawer>
      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Warning"
        centered
      >
        <p>Are you sure do you want to delete this product Variant?</p>
        <Group position="right">
          <Button onClick={() => deleteCategory()} color="red">
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
            data={data ? data.productSkus.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ProductSkus;
