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
      label: "Total Price",
      key: "total_price",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.total_price}</span>;
      },
    },
    {
      label: "Order Date",
      key: "created_at_human",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.created_at_human}</span>;
      },
    },

    {
      label: "Actions",
      key: "actions",
      sortable: false,
      searchable: false,
      render: (rowData) => {
        return (
          <ManualGearbox color="yellow"
            size={24}
            onClick={() => ManageOrder(`${rowData.id}`)}
          />
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
