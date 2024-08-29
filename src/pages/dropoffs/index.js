import { useMutation, useQuery } from "@apollo/client";
import { Card, Drawer, LoadingOverlay, ScrollArea } from "@mantine/core";
import { FiEdit, FiEye } from "react-icons/fi";
import { IoIosCall } from "react-icons/io";

import EditIcon from "@mui/icons-material/Edit";
import { GET_DROPOFFS } from "apollo/queries";
import { DropOffAddModal } from "components/Dropoff/DropOffAddModal";
import ManageDropOffModal from "components/Dropoff/ManageDropOffModal";
import B2bTable from "components/reusable/b2bTable";
import { customLoader } from "components/utilities/loader";
import React, { useEffect, useState } from "react";
import { ManualGearbox, Trash } from "tabler-icons-react";
import Pusher from "pusher-js";
import DropOffCard from "./card";
import Controls from "components/controls/Controls";
import CallIcon from "@mui/icons-material/Call";
import { RECALL_DRIVER_FOR_PENDING_DROPOFF } from "apollo/mutuations";
import { showNotification } from "@mantine/notifications";
const DropOffs = () => {
  const [size] = useState(10);
  const [opened, setOpened] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editId, setEditId] = useState();
  const [isCall, setCall] = useState(false);
   const [activePage, setActivePage] = useState(1);
  const [total, setTotal] = useState(0);

  const { data, loading, refetch } = useQuery(GET_DROPOFFS, {
    variables: {
      first: size,
      page: activePage,
    },
  });

  if (!total && data) {
    setTotal(data.dropoffs.paginatorInfo.lastPage);
  }

  const handleChange = (currentPage) => {
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
      label: "Cost",
      key: "cost",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.cost}</span>;
      },
    },
    {
      label: "Status",
      key: "status",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return <span>{rowData.status}</span>;
      },
    },
    {
      label: "Driver",
      key: "driver",
      sortable: true,
      searchable: true,
      render: (rowData) => {
        return (
          <span>
            {rowData.driver !== null ? rowData.driver?.name : "Unknown"}
          </span>
        );
      },
    },
    {
      label: "Date Created",
      key: "created_at",
      sortable: true,
      searchable: false,
      render: (rowData) => {
        return <span>{rowData.created_at}</span>;
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
              onClick={() => handleManageDropOff(`${rowData.id}`)}
            >
              <FiEye fontSize="medium" />
            </Controls.ActionButton>
            {rowData.status === "PENDING" && (
              <>
              {isCall?
               <Controls.ActionButton
               color="primary"
             >
               Calling
             </Controls.ActionButton>:
              
              <Controls.ActionButton
                color="primary"
                title="Call Driver"
                onClick={() => handleRecallDriver(`${rowData.id}`)}
              >
                <IoIosCall fontSize="medium" />
              </Controls.ActionButton>
      }
              </>
            )}
          </span>
        );
      },
    },
  ];
  const [recallDriverForPendingDropoff] = useMutation(
    RECALL_DRIVER_FOR_PENDING_DROPOFF,
    {
      refetchQueries: [
        {
          query: GET_DROPOFFS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
      ],
      onCompleted(data) {
        setCall(false)
        showNotification({
          color: "green",
          title: "Success",
          message: "Driver recalled successfully!",
        });
      },
      onError(error) {
        setCall(false)
        showNotification({
          color: "red",
          title: "Error",
          message: `${error.message}`,
        });
      },
    }
  );
  const handleRecallDriver = (id) => {
    setCall(true)
    recallDriverForPendingDropoff({ variables: { dropoff_id: id } });
  };

  const handleManageDropOff = (id) => {
    setOpenedEdit(true);
    setEditId(id);
  };


  useEffect(() => {
    const pusher = new Pusher("83f49852817c6b52294f", {
      cluster: "mt1",
    });

    const notificationChannel = pusher.subscribe("notification");

    notificationChannel.bind("new-item-created", function (newOrder) {
      refetch()
        .then(({ data }) => {
          const updatedDropOff = data.dropoffs.data || [];

          setTotal(data.dropoffs.paginatorInfo.lastPage);

          setDropOffs(updatedDropOff);
        })
        .catch((error) => {
          console.error("Error fetching updated orders:", error);
        });
    });

    return () => {
      pusher.disconnect();
    };
  }, [refetch]); // Include `refetch` in the dependencies array

  // Define a state to store the list of orders

  const [dropOffs, setDropOffs] = useState([]);

  return loading ? (
    <LoadingOverlay
      visible={loading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <div style={{ width: "98%", margin: "auto" }}>
      {" "}
      <Drawer
        opened={openedEdit}
        onClose={() => setOpenedEdit(false)}
        title="Managing Dropoff"
        padding="xl"
        size="50%"
        position="right"
      >
        <ManageDropOffModal setOpenedEdit={setOpenedEdit} editId={editId} />
      </Drawer>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Adding a DropOffs"
        padding="xl"
        size="80%"
        position="bottom"
      >
        <DropOffAddModal
          total={total}
          setTotal={setTotal}
          activePage={activePage}
          setActivePage={setActivePage}
          setOpened={setOpened}
        />
      </Drawer>
      <Card shadow="sm" p="lg">
        <DropOffCard />
        <ScrollArea>
          <B2bTable
            total={total}
            activePage={activePage}
            handleChange={handleChange}
            header={headerData}
            loading={loading}
            data={dropOffs.length ? dropOffs : data.dropoffs.data || []}
          />
        </ScrollArea>
      </Card>
    </div>
  );
};

export default DropOffs;
