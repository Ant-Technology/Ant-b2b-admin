import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDERS } from "apollo/queries";
import {
  Card,
  Drawer,
  LoadingOverlay,
  ScrollArea,
  useMantineTheme,
} from "@mantine/core";
import B2bTable from "components/reusable/b2bTable";
import { ManualGearbox } from "tabler-icons-react";
import { customLoader } from "components/utilities/loader";
import ManageOrderModal from "components/Order/ManageOrderModal";
import OrderCard from "./card"
import Controls from "components/controls/Controls";
import { FiEye } from "react-icons/fi";
const Orders = () => {
  const [size] = useState(10);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();

  const theme = useMantineTheme();

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading, fetchMore } = useQuery(GET_ORDERS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.orders.paginatorInfo.lastPage);
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
      label: "Order Date",
      key: "created_at",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.created_at}</span>;
      },
    },
    {
      label: "Retailer",
      key: "retailer",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.retailer?.name}</span>;
      },
    },
    {
      label: "Status",
      key: "status",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.state}</span>;
      },
    },
    //productSkuCount
    {
      label: "Product Count",
      key: "productSkuCount",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.productSkuCount}</span>;
      },
    },
    {
      label: "Total Price",
      key: "total_price",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.total_price}</span>;
      },
    },
    {
      label: "Actions",
      key: "actions",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <span style={{ marginLeft: "1px" }}>
          <Controls.ActionButton
            color="primary"
            title="View Detail"
            onClick={() => ManageOrder(`${rowData.id}`)}
          >
            <FiEye fontSize="medium" />
          </Controls.ActionButton>
        </span>
        );
      },
    },
  ];

  const handleChange = (currentPage) => {
    fetchMore({
      variables: {
        first: size,
        page: currentPage,
      },
    });
    setActivePage(currentPage);
  };

  const ManageOrder = (id) => {
    setOpenedEdit(true);
    setEditId(id);
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
        title="Managing Orders"
        padding="xl"
        onClose={() => setOpenedEdit(false)}
        position="bottom"
        size="80%"
      >
        <ManageOrderModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpenedEdit={setOpenedEdit}
          editId={editId}
        />
      </Drawer>

      <Card shadow="sm" p="lg">
        <OrderCard/>
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            loading={loading}
            data={data ? data.orders.data : []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Orders;
