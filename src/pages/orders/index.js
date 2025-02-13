import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_ORDERS,
  GET_ORDERS_BY_DROPOFF_STATUS,
  GET_ORDERS_BY_STATUS,
} from "apollo/queries";
import Pusher from "pusher-js";
import {
  Button,
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
import OrderCard from "./card";
import Controls from "components/controls/Controls";
import { FiEye } from "react-icons/fi";
const Orders = () => {
  const [dropoffStatus, setDropoffStatus] = useState(null); // Track selected status

  const [size, setSize] = useState("10");
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();

  const theme = useMantineTheme();

  //pagination states
  const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const { data, loading, fetchMore, refetch } = useQuery(
    dropoffStatus ? GET_ORDERS_BY_STATUS : GET_ORDERS,
    {
      variables: dropoffStatus
        ? {
            status: dropoffStatus,
            search: searchValue,
            first: parseInt(size),
            page: activePage,
            ordered_by: [
              {
                column: "CREATED_AT",
                order: "DESC",
              },
            ],
          }
        : {
            first: parseInt(size), // Pass size dynamically
            page: activePage,
            search: searchValue,
          },

      onCompleted: (data) => {
        if (data?.getOrdersByOrderItemStatus) {
          setTotal(data?.getOrdersByOrderItemStatus?.paginatorInfo.lastPage);
        } else {
          setTotal(data?.orders.paginatorInfo.lastPage);
        }
      },

      onError: (error) => {
        console.error("Query encountered an error:", error);
      },
    }
  );
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setActivePage(1);
  };

  useEffect(() => {
    const pusher = new Pusher("83f49852817c6b52294f", {
      cluster: "mt1",
    });

    const notificationChannel = pusher.subscribe("notification");

    notificationChannel.bind("new-item-created", function (newOrder) {
      if (!dropoffStatus || newOrder.state === dropoffStatus) {
        refetch()
          .then(({ data }) => {
            const updatedOrders =
              data?.orders?.data ||
              data?.getOrdersByOrderItemStatus?.data ||
              [];
            if (data?.getOrdersByOrderItemStatus) {
              setTotal(
                data?.getOrdersByOrderItemStatus?.paginatorInfo.lastPage
              );
            } else {
              setTotal(data?.orders.paginatorInfo.lastPage);
            }
            setOrders(updatedOrders);
          })
          .catch((error) => {
            console.error("Error fetching updated orders:", error);
          });
      }
    });

    return () => {
      pusher.disconnect();
    };
  }, [dropoffStatus, refetch]); // Include `refetch` in the dependencies array

  const [confirmedSearch, setConfirmedSearch] = useState("");

  const [orders, setOrders] = useState([]);

  const clearFilter = () => {
    setDropoffStatus(null);
    setSearchValue("");
  };

  const clearInput = () => {
    setSearchValue("");
    setDropoffStatus(null);
    setConfirmedSearch("")
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
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.retailer?.name}</span>;
      },
    },
    {
      label: "Status",
      key: "status",
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.state}</span>;
      },
    },
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
      sortable: false,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.total_price}</span>;
      },
    },
    {
      label: "Warehouse",
      key: "warehouse",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData?.warehouse.name}</span>;
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
  const handleManualSearch = (searchTerm) => {
    setSearchValue(searchTerm);
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
        <OrderCard
          onCardClick={setDropoffStatus}
          handelSearch={setSearchValue}
          clearFilter={clearFilter}
        />
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            handelSearch={handleManualSearch}
            clearInput={clearInput}
            searchValue={confirmedSearch}
            onSearchChange={setConfirmedSearch}
            dropoffStatus={dropoffStatus}
            loading={loading}
            data={
              orders.length
                ? orders
                : data?.orders?.data ||
                  data?.getOrdersByOrderItemStatus?.data ||
                  []
            }
            size={size}
            handlePageSizeChange={handlePageSizeChange}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Orders;
