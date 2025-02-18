import {
  Button,
  Card,
  Drawer,
  LoadingOverlay,
  ScrollArea,
  SimpleGrid,
  Table,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import { Box } from "@mui/material";
import axios from "axios";
import { API } from "utiles/url";
import EditIcon from "@mui/icons-material/Edit";
import {Trash } from "tabler-icons-react";
import { customLoader } from "components/utilities/loader";
import Controls from "components/controls/Controls";
import { FiEdit, FiEye } from "react-icons/fi";
import FeedbackTypeDetailModal from "./feedbacktypeDetail";
import { Plus } from "tabler-icons-react";
import {Add} from "./add";
export default function FeedbackTypes({}) {
  const [data, setData] = useState([]);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/feedback-types`, config);
      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const [openedDetail, setOpenedDetail] = useState(false);

  const [feedback, setFeedback] = useState(null);
  const handleDetail = (row) => {
    setFeedback(row);
    setOpenedDetail(true);
  };
  const theme = useMantineTheme();
  const rows = data?.map((element) => (
    <tr key={element.id}>
      <td>
        <span>{element.id}</span>
      </td>
      <td>{element.name}</td>
      <td>{element.status}</td>
      <td>{element.feedbacks?.length}</td>
      <td>
        {new Date(element?.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </td>
      <td>
      <Controls.ActionButton
              color="primary"
              title="Update"
             // onClick={() => handleEditSales(row)}
            >
              <EditIcon style={{ fontSize: "1rem" }} />
            </Controls.ActionButton>
        <span style={{ marginLeft: "1px" }}>
          <Controls.ActionButton
            color="primary"
            title="View Detail"
            onClick={() => handleDetail(element.feedbacks)}
          >
            <FiEye fontSize="medium" />
          </Controls.ActionButton>
        </span>
        <Controls.ActionButton
              color="primary"
              title="Delete"
             // onClick={() => handleDelete(`${row.id}`)}
            >
              <Trash size={17} />
            </Controls.ActionButton>
      </td>
    </tr>
  ));
  return data?.length === 0 ? (
    <LoadingOverlay
      visible={data?.length === 0}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <div style={{ width: "98%", margin: "auto" }}>
      <Drawer
        opened={openedDetail}
        overlayColor={
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2]
        }
        overlayOpacity={0.55}
        overlayBlur={3}
        title="Feedback Type Detail"
        padding="xl"
        onClose={() => setOpenedDetail(false)}
        position="bottom"
        size="80%"
      >
        <FeedbackTypeDetailModal
          setOpenedDetail={setOpenedDetail}
          row={feedback}
        />
      </Drawer>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        padding="xl"
        size="40%"
        styles={{
          closeButton: {
            color: "black",
            marginTop: "50px",
          },
        }}
        position="right"
      >
        <Add fetchData={fetchData} setOpened={setOpened} />
      </Drawer>

      <Card shadow="sm" p="lg">
        <ScrollArea>
          <SimpleGrid cols={3}>
            <div>
              <Button
                onClick={() => setOpened(true)}
                style={{
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                  marginBottom:"10px"
                }}
                leftIcon={<Plus size={14} />}
              >
                Add
              </Button>
            </div>
            <div></div>

            <div></div>
          </SimpleGrid>
          <Table style={{ width: "100%", minWidth: "600px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F1F1F1" }}>
                <th>Id</th>
                <th>Name</th>
                <th>Status</th>
                <th>Feedbacks</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
