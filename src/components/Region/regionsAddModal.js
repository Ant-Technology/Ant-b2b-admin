import {
  TextInput,
  Grid,
  Text,
  Stack,
  ScrollArea,
  Button,
  ActionIcon,
  LoadingOverlay,
  Group,
} from "@mantine/core";
import React from "react";
import { useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { Trash } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import { CREATE_REGIONS } from "apollo/mutuations";
import { GET_REGIONS } from "apollo/queries";

const RegionsAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  // mutation
  const [addRegion, { loading: regionLoading }] = useMutation(CREATE_REGIONS, {
    update(cache, { data: { createRegion } }) {
      cache.updateQuery(
        {
          query: GET_REGIONS,
          variables: {
            first: parseInt(10),
            page: activePage,
            search: "",
          },
        },
        (data) => {
          return {
            regions: {
              ...data.regions,
              data: [createRegion, ...data.regions.data],
            },
          };
        }
      );
    },
  });

  // form state
  const form = useForm({
    initialValues: {
      name: ""
    },
  });

  const { height } = useViewportSize();
  const submit = () => {
    console.log(form.values);
    addRegion({
      variables: {
        name: form.values.name,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Region Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        setOpened(true);
        showNotification({
          color: "red",
          title: "Error",
          message: "Region Not Created Successfully",
        });
      },
    });
  };
  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <LoadingOverlay
        visible={regionLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
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
  );
};

export default RegionsAddModal;
