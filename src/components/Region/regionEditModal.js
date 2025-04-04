import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  LoadingOverlay,
  ActionIcon,
  Text,
  Group,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { Trash } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import { UPDATE_REGION } from "apollo/mutuations";
import { GET_REGION } from "apollo/queries";

const RegionEditModal = ({ editId, setOpenedEdit }) => {
  const [location, setLocation] = useState({});

  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (editId) {
      console.log(editId);
      form.setValues({
        name: editId.name,
      });
    }
  }, [editId]);

  const { height } = useViewportSize();
  const [updateRegion, { loading: regionLoading }] = useMutation(UPDATE_REGION);
  const submit = () => {
    updateRegion({
      variables: {
        id: editId.id,
        name: form.values.name,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Region updated Successfully",
        });
        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Region Not updated Successfully",
        });
      },
    });
  };

  return (
    <>
      <LoadingOverlay
        visible={editId === null || regionLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />

      <ScrollArea style={{ height: height / 1.5 }} type="auto" offsetScrollbars>
      <form onSubmit={form.onSubmit(() => submit())} noValidate>
        <Stack>
          <Grid grow>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Region Name"
                placeholder="Enter region name "
                {...form.getInputProps("name")}
              />
            </Grid.Col>
          
          </Grid>
          <Grid>
            <Grid.Col span={8}>
              <Button
                style={{
                  marginTop: "15px",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                type="submit"
                fullWidth
              >
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
      </ScrollArea>
    </>
  );
};

export default RegionEditModal;
