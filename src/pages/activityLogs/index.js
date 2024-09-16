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
import { GET_ACTIVITY_LOGS, GET_PRODUCTS } from "apollo/queries";
import ProductDetailModal from "components/Product/ProductDetail";
import ProductAddModal from "components/Product/productAddModal";
import ProductEditModal from "components/Product/productEditModal";
import Controls from "components/controls/Controls";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import React, { useEffect, useState } from "react";
import { Edit, ManualGearbox, Trash } from "tabler-icons-react";

const Activity = () => {
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [openedDetail, setOpenedDetail] = useState(false);
  //
  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState();
  const [deleteID, setDeleteID] = useState(false);
  const [openedDelete, setOpenedDelete] = useState(false);

  const theme = useMantineTheme();
 

  const { data, loading, fetchMore } = useQuery(GET_ACTIVITY_LOGS, {
    variables: {
      first: size,
      page: activePage,
      ordered_by: [
        {
          column: "CREATED_AT",
          order: "DESC",
        },
      ],
    },
  });
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!total && data) {
    setTotal(data.getActivityLogs.paginatorInfo.lastPage);
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
      label: "Name",
      key: "name",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.log_name}</span>;
      },
    },
    {
      label: "Event",
      key: "event",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.event}</span>;
      },
    },
    {
      label: "Causer",
      key: "causer",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.causer?.name}</span>;
      },
    },
    {
        label: "Details",
        key: "details",
        sortable: false,
        searchable: false,
        render: (rowData) => {
          const properties = JSON.parse(rowData.properties); // Parse properties JSON
    
          // Check log_name and return corresponding data
          if (rowData.log_name === "cart") {
            return <span>Quantity: {properties.quantity}</span>;
          } else if (rowData.log_name === "order" || rowData.log_name === "dropoff") {
            return <span>Status: {properties.items?.[0]?.state || properties.status}</span>;
          }
          return null;
        },
      },
    
    {
        label: "Date",
        key: "created_at",
        sortable: true,
        searchable: false,
        render: (rowData) => {
          return <span>{rowData.created_at}</span>;
        },
      },
  ];



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
            loading={loading}
            data={data ? data.getActivityLogs.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Activity;
